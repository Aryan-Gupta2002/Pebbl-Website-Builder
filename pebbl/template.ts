import { Template, waitForPort } from "e2b";

export const template = Template()
  .fromImage("node:22.17.1-slim")
  .setUser("root")
  .runCmd("apt-get update && apt-get install -y curl && apt-get clean")
  .runCmd("npx --yes create-next-app@16.0.1 /home/user/nextjs-app --yes")
  .runCmd("cd /home/user/nextjs-app && npx --yes shadcn@3.5.0 init --yes -b neutral --force")
  .runCmd("cd /home/user/nextjs-app && npx --yes shadcn@3.5.0 add --all --yes")
  .runCmd("cp -r /home/user/nextjs-app/. /home/user/ && rm -rf /home/user/nextjs-app")
  .setStartCmd(
    "cd /home/user && npx next dev --turbopack",
    waitForPort(3000)
  );