"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

const Page = () => {
  const [value, setvalue] = useState("");
  const router = useRouter();
  const trpc = useTRPC();

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onError: (e) => {
        toast.error(e.message);
      },
      onSuccess: (data) => {
        router.push(`/projects/${data.id}`);
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
          disabled={createProject.isPending}
          onClick={() => {
            createProject.mutate({ value: value });
          }}
        >
          Submit
        </Button>
        {/* {JSON.stringify(messages, null, 2)} */}
      </div>
    </div>
  );
};
export default Page;
