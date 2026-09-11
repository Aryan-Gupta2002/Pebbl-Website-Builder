"use client";
import Link from "next/link";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";

export const ProjectsList = () => {
  const trpc = useTRPC();
  const { user } = useUser();
  const { data: projects } = useQuery(trpc.projects.getMany.queryOptions());
  if (!user) return null;
  return (
    <section className="mx-auto w-full max-w-3xl pt-22 pb-24 sm:pt-20 sm:pb-28">
      {/* Section heading */}
      <div className="flex flex-col gap-1 mb-6">
        <p className="text-[11px] font-medium tracking-widest text-violet-400/70 uppercase">
          {user.firstName}&apos;s workspace
        </p>
        <h2 className="text-lg font-semibold text-white/90 tracking-tight sm:text-xl">
          Your recent creations
        </h2>
      </div>

      {/* Empty state */}
      {projects?.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.10] bg-white/[0.03] px-6 py-14 text-center text-sm text-white/35">
          No projects yet — ask Pebbl to build something.
        </div>
      ) : (
        /* 2-col max on desktop */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#0c1230]/40 backdrop-blur-3xl transition-all duration-500 outline-none hover:shadow-[0_8px_32px_-8px_rgba(139,92,246,0.15)] focus-visible:ring-2 focus-visible:ring-violet-400/40"
            >
              {/* Luminous border layer */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl border border-transparent [background:linear-gradient(to_bottom,rgba(255,255,255,0.1),rgba(255,255,255,0.02))_border-box] [mask:linear-gradient(#fff_0_0)_padding-box,linear-gradient(#fff_0_0)] [-webkit-mask-composite:xor] [mask-composite:exclude] transition-all duration-300 group-hover:opacity-100 opacity-60"></div>
              
              {/* Sub-border color illumination on hover */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br from-lavender-400/10 via-violet-500/5 to-cyan-400/10 mix-blend-overlay"></div>

              {/* Brighter upper edge highlight */}
              <div className="pointer-events-none absolute top-0 inset-x-6 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Inner highlight & shadow */}
              <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_2px_rgba(255,255,255,0.03),inset_0_-2px_4px_rgba(0,0,0,0.2)]"></div>

              <div className="relative z-10 flex flex-col h-full">
                {/* Preview image */}
                <div className="relative h-40 overflow-hidden sm:h-44">
                  <Image
                    src="/project-list-card.jpeg"
                    alt="Project preview"
                    fill
                    className="object-cover transition-[filter] duration-500 group-hover:brightness-110"
                  />
                </div>

                {/* Card footer */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-white/[0.04]">
                  <h3 className="truncate text-[14px] font-medium text-white/90">
                    {project.name}
                  </h3>
                  <span className="shrink-0 text-[11px] text-white/40 whitespace-nowrap font-light">
                    {formatDistanceToNow(project.updatedAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};
