import { Navbar } from "@/modules/home/ui/components/navbar";
import { BackgroundImage } from "@/modules/home/ui/components/background-image";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <main className="dark relative flex flex-col min-h-screen bg-[#08091a]">
      <Navbar />
      {/* Background layer: BG-cloud.png + bottom fade, pinned behind content */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <BackgroundImage />
      </div>
      <div className="relative flex flex-1 flex-col px-4 pb-4 sm:px-6">
        {children}
      </div>
    </main>
  );
};

export default Layout;
