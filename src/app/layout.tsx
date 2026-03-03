import type { Metadata } from "next";
import { Fredoka, JetBrains_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { WorldProvider } from "@/lib";

const displayFont = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Purr & Prism | Candy Arcade Sanctuary",
  description:
    "A playful, tactile cat sanctuary with arcade energy. Wander rooms, follow cats, and find calm in motion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        data-theme="candy-arcade"
        data-motion="adaptive"
        className={`${displayFont.variable} ${bodyFont.variable} ${monoFont.variable} antialiased arcade-body`}
      >
        <WorldProvider>{children}</WorldProvider>
      </body>
    </html>
  );
}
