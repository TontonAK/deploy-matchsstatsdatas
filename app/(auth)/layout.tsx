import Image from "next/image";
import { PropsWithChildren } from "react";

export default function Layout(props: PropsWithChildren) {
  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        {props.children}
      </div>
      {/* Right side - Rugby Image */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
        <Image
          src="/championsprc3.jpg"
          alt="Rugby match"
          width={1600}
          height={1066}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>
    </div>
  );
}
