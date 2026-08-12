import { Sandbox } from "@e2b/code-interpreter";

export async function getSandbox(sandBoxId: string) {
  const sandBox = await Sandbox.connect(sandBoxId);
  return sandBox;
}
