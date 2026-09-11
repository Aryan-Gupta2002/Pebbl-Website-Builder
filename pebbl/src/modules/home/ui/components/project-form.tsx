"use client";
import { z } from "zod";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import TextareaAutosize from "react-textarea-autosize";
import { ArrowUpIcon, Loader2Icon } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Form, FormField } from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { PROJECT_TEMPLATES } from "../../constants";
import { useClerk } from "@clerk/nextjs";

const formSchema = z.object({
  value: z
    .string()
    .min(1, { message: "Value is required" })
    .max(10000, { message: "Value is required" }),
});

export const ProjectForm = () => {
  const router = useRouter();
  const clerk = useClerk();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      value: "",
    },
  });

  const createProject = useMutation(
    trpc.projects.create.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries(trpc.projects.getMany.queryOptions());
        queryClient.invalidateQueries(trpc.usage.status.queryOptions());
        router.push(`/projects/${data.id}`);
      },
      onError: (error) => {
        toast.error(error.message);
        if (error.data?.code === "UNAUTHORIZED") {
          clerk.openSignIn();
        }
        if (error.data?.code === "TOO_MANY_REQUESTS") {
          router.push("/pricing");
        }
      },
    }),
  );
  const isPending = createProject.isPending;
  const isButtonDisabled = isPending || !form.formState.isValid;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await createProject.mutateAsync({
      value: values.value,
    });
  };

  const onSelect = (value: string) => {
    form.setValue("value", value, {
      shouldDirty: true,
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  return (
    <Form {...form}>
      <section className="space-y-5">
        {/* Main prompt input */}
        <div className="group relative">
          {/* Glow — same exact radius/shape as the form */}
          <div
            aria-hidden
            className="
    pointer-events-none absolute inset-0
    rounded-[30px]
    shadow-[
      0_0_6px_rgba(255,255,255,0.70),
      0_0_14px_rgba(225,232,255,0.45),
      0_0_24px_rgba(200,210,255,0.22)
    ]
  "
          />

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="
    relative flex min-h-[118px] w-full flex-col
    overflow-hidden
    rounded-[30px]

    border-[3px] border-white/75

    bg-[#7180b0]/16
    backdrop-blur-[18px]
  "
          >
            {/* Interior rim — thin bright white glow along the inner edge of the border,
                fading to transparent toward the center */}
            <div
              aria-hidden
              className="
        pointer-events-none absolute inset-[2.5px]
        rounded-[calc(30px-2.5px)]
        border-2 border-white/95
        blur-[2px] sm:blur-[3px]
        [transform:translateZ(0)]
      "
            />

            <div className="relative z-10 flex min-h-[112px] flex-col px-5 py-4 sm:px-6">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <TextareaAutosize
                    {...field}
                    disabled={isPending}
                    minRows={1}
                    maxRows={10}
                    placeholder="Ask Pebbl to build..."
                    className="
              w-full flex-1 resize-none
              bg-transparent
              text-[15px] font-light leading-relaxed
              text-white/95
              outline-none
              placeholder:text-white/65
              sm:text-[16px]
            "
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        form.handleSubmit(onSubmit)(e);
                      }
                    }}
                  />
                )}
              />

              <div className="mt-auto flex items-end justify-between gap-3 pt-3">
                <div className="flex min-w-0 items-center gap-2 text-[11px] font-light text-white/55">
                  <kbd className="inline-flex h-5 items-center gap-0.5 rounded-md border border-white/25 bg-white/[0.08] px-1.5 font-sans text-[10px] text-white/70">
                    <span>⌘</span>
                    Enter
                  </kbd>

                  <span>to submit</span>
                  <span className="text-white/30">·</span>

                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-[10px] text-white/75">✦</span>
                    Powered by AI
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isButtonDisabled}
                  className={cn(
                    "size-9 shrink-0 rounded-full border backdrop-blur-md transition-all duration-300 sm:size-10",
                    isButtonDisabled
                      ? "border-white/15 bg-white/[0.05] text-white/25"
                      : "border-white/40 bg-white/[0.12] text-white shadow-[0_0_10px_rgba(235,240,255,0.28)] hover:border-white/60 hover:bg-white/[0.18]",
                  )}
                >
                  {isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <ArrowUpIcon className="size-4" />
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* Suggestions */}
        <div className="flex flex-wrap mt-10 items-center justify-center gap-2 pt-1">
          {PROJECT_TEMPLATES.map((template) => (
            <button
              key={template.title}
              type="button"
              onClick={() => onSelect(template.prompt)}
              className="
              group relative
              rounded-full p-px
              bg-gradient-to-r
              from-white/15
              via-violet-200/15
              to-pink-200/15
              transition-all duration-300
              hover:from-white/25
              hover:via-violet-200/30
              hover:to-pink-200/25
            "
            >
              <span
                className="
                relative block rounded-full
                bg-[#17204a]/55
                px-4 py-1.5
                text-[12px] font-light tracking-wide
                text-white/60
                backdrop-blur-xl
                transition-all duration-300
                group-hover:bg-[#202a59]/65
                group-hover:text-white/90
              "
              >
                {template.title.replace("Build a ", "")}
              </span>
            </button>
          ))}
        </div>
      </section>
    </Form>
  );
};
