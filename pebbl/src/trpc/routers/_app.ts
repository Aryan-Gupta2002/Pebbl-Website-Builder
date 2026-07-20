import { z } from "zod";
import { baseProcedure, createTRPCRouter } from "../init";
import { Input } from "@base-ui/react";
import { inngest } from "@/inngest/client";
export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(
      z.object({
        value: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await inngest.send({
        name: "app/task.created",
        data: {
          value: input.value,
        },
      });
      return { ok: "Success" };
    }),
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});

export type AppRouter = typeof appRouter;
