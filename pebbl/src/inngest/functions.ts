import { success } from "zod";
import { inngest } from "./client";
import { createAgent, openai } from "@inngest/agent-kit";
import { Sandbox } from "@e2b/code-interpreter";
import { getSandbox } from "./utils";

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
      system:
        "You are an expert next.js developer. You write readable,maintanable code. You write simple Next.js & React snippets.",
      model: openai({
        model: "nvidia/nemotron-nano-9b-v2:free",
        apiKey: process.env.OPENROUTER_API_KEY,
        baseUrl: process.env.BASE_URL,
      }),
    });
    const { output } = await codeAgent.run(
      `Write the following snippet: ${event.data.value}`,
    );

    const sandBoxUrl = await step.run("get-sandbox-url", async () => {
      const sandBox = await getSandbox(sandBoxId);
      const host = sandBox.getHost(3000);
      return `https://${host}`;
    });

    return { output, sandBoxUrl };
  },
);
