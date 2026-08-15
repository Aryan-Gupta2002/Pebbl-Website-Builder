"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const [value, setvalue] = useState("");
  const trpc = useTRPC();

  const { data: messages } = useQuery(trpc.messages.getMany.queryOptions());

  const createMessage =  useMutation(
    trpc.messages.create.mutationOptions({
      onSuccess: () => {
        toast.success("Message Created");
      },
    }),
  );
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="p-4 max-w-7xl mx-auto">
        <Input
          value={value}
          onChange={(e) => {
            setvalue(e.target.value);
          }}
        />
        <Button
          className="bg-white text-black hover:bg-gray-200"
          disabled={createMessage.isPending}
          onClick={() => {
            createMessage.mutate({ value: value });
          }}
        >
          Invoke background job
        </Button>
        {JSON.stringify(messages, null, 2)}
      </div>
    </div>
  );
};
export default Page;
