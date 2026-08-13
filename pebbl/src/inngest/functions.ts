import { inngest } from "./client";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT } from "@/prompt";

export const processTask = inngest.createFunction(
  { id: "process-task2", triggers: { event: "app/task.created" } },
  async ({ event, step }) => {
    const sandBoxId = await step.run("get-sandbox-id", async () => {
      const sandBox = await Sandbox.create(
        "actonides-default-team/pebbl-nextjs-test",
      );
      return sandBox.sandboxId;
    });
    const codeAgent = createAgent({
      name: "Code Agent",
      system: PROMPT,
      model: openai({
        model: "nvidia/nemotron-nano-9b-v2:free",
        // model: "nvidia/nemotron-3.5-lightning:free",
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: process.env.BASE_URL,
      }),
      tools: [
        createTool({
          name: "terminal",
          description: "Use the terminal to run commands",
          parameters: z.object({
            command: z.string(),
          }),
          handler: async ({ command }, { step }) => {
            return await step?.run("terminal", async () => {
              const buffers = { stdout: "", stderr: "" };
              try {
                const sandBox = await getSandbox(sandBoxId);
                const result = await sandBox.commands.run(command, {
                  onStdout: (data: string) => {
                    buffers.stdout += data;
                  },
                  onStderr: (data: string) => {
                    buffers.stderr += data;
                  },
                });
                // Change 1
                // return result.stdout;
                return JSON.stringify({
                  exitCode: result.exitCode,
                  stdout: result.stdout,
                  stderr: result.stderr,
                });
              } catch (e) {
                console.error(
                  `Command Failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`,
                );
                return `Command Failed: ${e} \nstdout: ${buffers.stdout}\nstderror: ${buffers.stderr}`;
              }
            });
          },
        }),
        createTool({
          name: "createOrUpdateFiles",
          description: "Create or Update files in the sandbox",
          parameters: z.object({
            files: z.array(
              z.object({
                path: z.string(),
                content: z.string(),
              }),
            ),
          }),
          handler: async ({ files }, { step, network }) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandBox = await getSandbox(sandBoxId);
                  for (const file of files) {
                    await sandBox.files.write(file.path, file.content);
                    updatedFiles[file.path] = file.content;
                  }
                  return updatedFiles;
                } catch (e) {
                  return "Error: " + e;
                }
              },
            );
            if (typeof newFiles === "object") {
              network.state.data.files = newFiles;
            }
          },
        }),
        createTool({
          name: "readFiles",
          description: "Read files from the sandbox",
          parameters: z.object({
            files: z.array(z.string()),
          }),
          handler: async ({ files }, { step }) => {
            return await step?.run("readFiles", async () => {
              try {
                const sandBox = await getSandbox(sandBoxId);
                const contents = [];
                for (const file of files) {
                  const content = await sandBox.files.read(file);
                  contents.push({ path: file, content });
                }
                return JSON.stringify(contents);
              } catch (e) {
                return "Error: " + e;
              }
            });
          },
        }),
      ],
      lifecycle: {
        onResponse: async ({ result, network }) => {
          const lastAssistantMessageText =
            lastAssistantTextMessageContent(result);
          if (lastAssistantMessageText && network) {
            if (lastAssistantMessageText.includes("<task_summary")) {
              network.state.data.summary = lastAssistantMessageText;
            }
          }
          return result;
        },
      },
    });

    const network = createNetwork({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 15,
      router: async ({ network }) => {
        const summary = network.state.data.summary;
        if (summary) {
          return;
        }
        return codeAgent;
      },
    });

    // Old-test
    // const { output } = await codeAgent.run(
    //   `Write the following snippet: ${event.data.value}`,
    // );

    // Change 2
    let result = await network.run(event.data.value);
    // Verify generated code and give the agent up to 3 chances to fix it
    for (let attempt = 1; attempt <= 3; attempt++) {
      const buildResult = await step.run(
        `verify-build-${attempt}`,
        async () => {
          const sandBox = await getSandbox(sandBoxId);

          const build = await sandBox.commands.run("npm run build", {
            timeoutMs: 120_000,
          });

          return {
            exitCode: build.exitCode,
            stdout: build.stdout,
            stderr: build.stderr,
          };
        },
      );

      // Build successful
      if (buildResult.exitCode === 0) {
        break;
      }

      // Build failed after all attempts
      if (attempt === 3) {
        throw new Error(
          `App failed to build after 3 attempts:\n${
            buildResult.stderr || buildResult.stdout
          }`,
        );
      }

      result.state.data.summary = undefined;

      // Send the actual build error back to the coding agent
      result = await network.run(`
      The application you generated does not build successfully.

      Build error:

      ${buildResult.stderr || buildResult.stdout}

      Fix the build errors.

      Use readFiles to inspect the existing files when necessary.
      Use createOrUpdateFiles to make the fixes.
      Do not recreate the project from scratch.
`);
    }

    const sandBoxUrl = await step.run("get-sandbox-url", async () => {
      const sandBox = await getSandbox(sandBoxId);
      const host = sandBox.getHost(3000);
      return `https://${host}`;
    });

    return {
      url: sandBoxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
