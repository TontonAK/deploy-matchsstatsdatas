import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Montserrat, Noto_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s - PRC Datas",
    default: "PRC Datas",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={cn(
          "h-full bg-background font-noto-sans antialiased",
          notoSans.variable,
          montserrat.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
