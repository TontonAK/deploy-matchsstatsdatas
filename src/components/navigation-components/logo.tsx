import Image from "next/image";

export default function Logo() {
  return (
    <div className="absolute top-1/2 left-20 -translate-y-1/2 z-10 flex items-center">
      <Image
        src="/logo.png"
        alt="Logo du club"
        width={40}
        height={40}
        className="h-10"
      />
    </div>
  );
}
