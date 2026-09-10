"use client";

import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090b] px-6 text-white">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-125 w-125 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/[0.07] blur-[120px]" />
        <div className="absolute left-[15%] top-[15%] h-64 w-64 rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      {/* Grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <section className="relative z-10 w-full max-w-lg text-center">
        {/* Error icon */}
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 shadow-[0_0_60px_-15px_rgba(239,68,68,0.5)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-9 w-9 text-red-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M10.3 3.8 2.5 17.3A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.7L13.7 3.8a2 2 0 0 0-3.4 0Z"
            />
          </svg>
        </div>

        {/* Status */}
        <div className="mb-4 flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-red-400">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_10px_rgba(248,113,113,0.8)]" />
          Something went wrong
        </div>

        {/* Heading */}
        <h1 className="mb-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          We hit an unexpected error.
        </h1>

        <p className="mx-auto mb-9 max-w-md text-sm leading-6 text-zinc-400 sm:text-base">
          Something didn&apos;t go as planned. You can try again, or return to
          the homepage if the problem continues.
        </p>

        {/* Actions */}
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-all duration-200 hover:bg-zinc-200 active:scale-[0.98] sm:w-auto"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5m-5 4a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"
              />
            </svg>
            Try again
          </button>

          <a
            href="/"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-5 py-3 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800 hover:text-white active:scale-[0.98] sm:w-auto"
          >
            Go home
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9 18 6-6-6-6"
              />
            </svg>
          </a>
        </div>

        {/* Error ID */}
        {error.digest && (
          <div className="mt-10">
            <span className="rounded-md border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 font-mono text-[11px] text-zinc-600">
              Error ID: {error.digest}
            </span>
          </div>
        )}
      </section>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-1/2 h-px w-[60%] -translate-x-1/2 bg-linear-to-r from-transparent via-zinc-700/50 to-transparent" />
    </main>
  );
}
