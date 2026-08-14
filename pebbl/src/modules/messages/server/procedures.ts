import prisma from "@/lib/db";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
export const messageRouter = createTRPCRouter({
  create: baseProcedure
    .input(
      z.object({
        value: z.string().min(1, { message: "Message is required" }),
      }),
    )
    .mutation(async ({ input }) => {
      await prisma.message.create({
        data: {
          content: input.value,
          role: "USER",
          type: "RESULT",
        },
      });
    }),
});
