import { success } from "zod";
import { inngest } from "./client";
import { createAgent, openai } from "@inngest/agent-kit";

export const processTask = inngest.createFunction(
  { id: "process-task2", triggers: { event: "app/task.created" } },
  async ({ event }) => {
    const summarizer = createAgent({
      name: "summarizer",
      system: "You are an expert summarizer. You summarize in 3 words",
      model: openai({
        model: "meta/llama-3.1-8b-instruct",
        apiKey: process.env.NIM_API_KEY,
        baseUrl: process.env.BASE_URL,
      }),
    });
    const { output } = await summarizer.run(
      `Summarize the following text: ${event.data.value}`,
    );
    return { output };
  },
);
