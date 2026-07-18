"use client";
import prisma from "@/lib/db";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const Page = () => {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.hello.queryOptions({ text: "Aryan" }));
  trpc.hello.queryOptions({ text: "Hello World" });
  return <div>{JSON.stringify(data)}</div>;
};
export default Page;
