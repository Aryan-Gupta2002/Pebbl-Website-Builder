import { Sandbox } from "@e2b/code-interpreter";
import { AgentResult, TextMessage } from "@inngest/agent-kit";

export async function getSandbox(sandBoxId: string) {
  const sandBox = await Sandbox.connect(sandBoxId);
  return sandBox;
}

export function lastAssistantTextMessageContent(result: AgentResult) {
  const lastAssistantTextMsgIndex = result.output.findLastIndex(
    (message) => message.role === "assistant",
  );
  const message = result.output[lastAssistantTextMsgIndex] as
    | TextMessage
    | undefined;
  return message?.content
    ? typeof message.content === "string"
      ? message.content
      : message.content.map((c) => c.text).join("")
    : undefined;
}
