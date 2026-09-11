import Image from "next/image";

export const BackgroundImage = () => {
  return (
    <>
      <Image
        src="/BG-cloud4.jpg"
        alt=""
        aria-hidden
        fill
        priority
        className="object-cover object-top"
        sizes="100vw"
      />
      {/* Fade the cloud atmosphere into the projects background */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-t from-[#08091a] to-transparent"
      />
    </>
  );
};
