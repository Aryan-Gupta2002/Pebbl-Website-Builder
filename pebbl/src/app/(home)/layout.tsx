import { Navbar } from "@/modules/home/ui/components/navbar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <main className="relative flex flex-col min-h-screen">
      <Navbar />
      <div
        aria-hidden
        className="absolute inset-0 h-full w-full bg-background dark:bg-[radial-gradient(#393e4a_1px,transparent_1px)] bg-[radial-gradient(#dadde2_1px,transparent_1px)] bg-size-[16px_16px]"
      />
      <div className="relative flex flex-1 flex-col px-4 pb-4">{children}</div>
    </main>
  );
};

export default Layout;
