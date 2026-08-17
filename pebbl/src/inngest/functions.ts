import { inngest } from "./client";
import {
  createAgent,
  createNetwork,
  createTool,
  openai,
  type Tool,
} from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox, lastAssistantTextMessageContent } from "./utils";
import { z } from "zod";
import { PROMPT } from "@/prompt";
import prisma from "@/lib/db";

interface AgentState {
  summary: string;
  files: { [path: string]: string };
}

export const codeAgentFunction = inngest.createFunction(
  { id: "code-agent", triggers: { event: "code-agent/run" }, retries: 0 },
  async ({ event, step }) => {
    const sandBoxId = await step.run("get-sandbox-id", async () => {
      const sandBox = await Sandbox.create(
        "actonides-default-team/pebbl-nextjs-test",
        {
          timeoutMs: 30 * 60 * 1000,
          lifecycle: {
            onTimeout: "pause",
            autoResume: true,
          },
        },
      );
      console.log(await sandBox.getInfo());
      return sandBox.sandboxId;
    });
    const codeAgent = createAgent<AgentState>({
      name: "Code Agent",
      system: PROMPT,
      model: openai({
        // model: "nvidia/nemotron-nano-9b-v2:free",
        // model: "cohere/north-mini-code:free",
        model: "[次]gemini-3-flash-preview",
        // model: "nvidia/nemotron-3.5-lightning:free",
        // apiKey: process.env.OPENROUTER_API_KEY,
        apiKey: process.env.LINKAPI_KEY,
        // baseUrl: process.env.BASE_URL,
        baseUrl: "https://api.linkapi.ai/v1",
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
          handler: async (
            { files },
            { step, network }: Tool.Options<AgentState>,
          ) => {
            const newFiles = await step?.run(
              "createOrUpdateFiles",
              async () => {
                try {
                  const updatedFiles = network.state.data.files || {};
                  const sandBox = await getSandbox(sandBoxId);
                  for (const file of files) {
                    const fullPath = file.path.startsWith(
                      "/home/user/nextjs-app",
                    )
                      ? file.path
                      : `/home/user/nextjs-app/${file.path.replace(/^\/?/, "")}`;
                    await sandBox.files.write(
                      fullPath,
                      file.content.replace(/\\n/g, "\n"),
                    );
                    updatedFiles[file.path] = file.content; // keep original key for consistency
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
                  const fullPath = file.startsWith("/home/user/nextjs-app")
                    ? file
                    : `/home/user/nextjs-app/${file.replace(/^\/?/, "")}`;
                  const content = await sandBox.files.read(fullPath);
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

    const network = createNetwork<AgentState>({
      name: "coding-agent-network",
      agents: [codeAgent],
      maxIter: 30,
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
          try {
            const build = await sandBox.commands.run(
              "cd /home/user/nextjs-app && npm run build",
              { timeoutMs: 900_000 },
            );
            return {
              exitCode: build.exitCode,
              stdout: build.stdout,
              stderr: build.stderr,
            };
          } catch (e: any) {
            return {
              exitCode: e?.result?.exitCode ?? 1,
              stdout: e?.result?.stdout ?? "",
              stderr: e?.result?.stderr ?? String(e),
            };
          }
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

      // result.state.data.summary = undefined

      // Send the actual build error back to the coding agent
      result = await network.run(`
      The application you generated does not build successfully.

      Build error:

      ${buildResult.stderr || buildResult.stdout}

      Fix the build errors.

      Use readFiles to inspect the existing files when necessary.
      Use createOrUpdateFiles to make the fixes.
      Do not recreate the project from scratch.
      After each fix, run \`npm run build\` yourself via the terminal to verify.
      Repeat fixing and building until \`npm run build\` exits with code 0.
      Only output <task_summary> once the build succeeds.
`);
    }
    // Start the verified production build with `next start` instead of dev mode.
    // The template's compile_page.sh already starts `next dev` on boot, so a
    // second dev server would fail to bind port 3000, and running `next build`
    // under a live dev server corrupts the shared `.next` folder (causing
    // "Internal Server Error"). Serve the production build instead.
    await step.run("start-server", async () => {
      const sandBox = await getSandbox(sandBoxId);
      // Stop the template's dev server. Use "[n]ext dev" so pkill's pattern
      // does not match this shell's own command line.
      await sandBox.commands.run("pkill -f '[n]ext dev' || true");
      await sandBox.commands.run(
        "cd /home/user/nextjs-app && npx next start -H 0.0.0.0 -p 3000",
        { background: true },
      );
    });

    const isError =
      !result.state.data.summary ||
      Object.keys(result.state.data.files || {}).length === 0;

    const sandBoxUrl = await step.run("get-sandbox-url", async () => {
      const sandBox = await getSandbox(sandBoxId);
      const host = sandBox.getHost(3000);
      const url = `https://${host}`;

      let ready = false;
      for (let i = 0; i < 30; i++) {
        const check = await sandBox.commands.run(
          `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`,
        );
        if (check.stdout.trim() === "200") {
          ready = true;
          break;
        }
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!ready) {
        throw new Error("Server did not become ready on port 3000 within 30s");
      }

      return url;
    });

    await step.run("save-result", async () => {
      if (isError) {
        return await prisma.message.create({
          data: {
            projectId: event.data.projectId,
            content: "Something went wrong. Please try again",
            role: "ASSISTANT",
            type: "ERROR",
          },
        });
      }
      return await prisma.message.create({
        data: {
          projectId: event.data.projectId,
          content: result.state.data.summary,
          role: "ASSISTANT",
          type: "RESULT",
          fragment: {
            create: {
              sandBoxUrl: sandBoxUrl,
              title: "Fragment",
              files: result.state.data.files,
            },
          },
        },
      });
    });

    return {
      url: sandBoxUrl,
      title: "Fragment",
      files: result.state.data.files,
      summary: result.state.data.summary,
    };
  },
);
