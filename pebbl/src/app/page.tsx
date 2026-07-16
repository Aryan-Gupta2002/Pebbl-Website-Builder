"use client";
import prisma from "@/lib/db";
import { useTRPC } from "@/trpc/client";

const Page = () => {
  const trpc = useTRPC();
  trpc.hello.queryOptions({ text: "Hello World" });
  return <div>Hello</div>;
};
export default Page;
