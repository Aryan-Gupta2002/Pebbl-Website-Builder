import { ProjectForm } from "@/modules/home/ui/components/project-form";
import { ProjectsList } from "@/modules/home/ui/components/projects-list";
import { Show } from "@clerk/nextjs";
import { Outfit, Noto_Serif_Display } from "next/font/google";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400"] });
const notoSerifDisplay = Noto_Serif_Display({
  subsets: ["latin"],
  style: ["italic"],
});

const Page = async () => {
  return (
    <div className="flex w-full flex-col relative overflow-hidden">
      {/* Subtle Structural Detailing (Tracing lines & accents) */}
      <div className="pointer-events-none absolute inset-0 flex justify-center overflow-hidden z-0">
        <div className="absolute top-0 w-full max-w-5xl h-full border-x border-white/[0.02] mix-blend-overlay"></div>
        <div className="absolute top-[35%] w-[120vw] h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
        <div className="absolute top-[20%] left-[20%] w-px h-64 bg-gradient-to-b from-transparent via-violet-400/[0.15] to-transparent"></div>
        <div className="absolute top-[15%] right-[25%] w-px h-48 bg-gradient-to-b from-transparent via-pink-400/[0.1] to-transparent"></div>
        {/* Subtle luminous accent */}
        <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/[0.03] blur-[100px] rounded-full mix-blend-screen"></div>
      </div>

      {/* Hero */}
      <section className="mx-auto flex w-full max-w-2xl flex-col items-center pt-20 sm:pt-24 md:pt-32 relative z-10">
        <div className="flex flex-col items-center gap-5 text-center">
          <h1 className="flex flex-col items-center gap-1">
            <span
              className={`text-[2rem] sm:text-[3rem] lg:text-[4rem] leading-tight text-white/90 tracking-tight font-light ${outfit.className}`}
            >
              Turn an idea into
            </span>
            <span className="flex items-baseline justify-center gap-2 sm:gap-3 -mt-2 sm:-mt-3 lg:-mt-4">
              <span
                className={`text-[2.5rem] sm:text-[4rem] lg:text-[2.8rem] leading-[1.1] tracking-normal bg-linear-to-r from-[#d9c4fd] via-[#9d7cf9] to-[#f472b6] bg-clip-text text-transparent pb-2 ${notoSerifDisplay.className}`}
              >
                Something
              </span>

              <span
                className={`text-[2rem] sm:text-[3rem] lg:text-[4rem] leading-tight text-white/90 tracking-tight font-light ${outfit.className}`}
              >
                real.
              </span>
            </span>
          </h1>
          <p className="max-w-md text-white/50 text-[15px] sm:text-[17px] leading-relaxed mt-2 font-light">
            Describe what you want to build.{" "}
            <span className="text-white/80 font-normal">
              Pebbl handles the rest.
            </span>
          </p>
        </div>

        {/* Project input — the visual centerpiece */}
        <div className="mt-12 w-full relative">
          {/* Line connection extending to composer */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent to-white/[0.15]"></div>
          <ProjectForm />
        </div>
      </section>

      {/* Recent projects — signed-in only */}
      <Show when="signed-in">
        <div className="relative z-10 mt-11">
          <ProjectsList />
        </div>
      </Show>
    </div>
  );
};

export default Page;
