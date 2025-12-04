import type { Metadata } from "next";
import { Press_Start_2P, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";

const pressStart = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-press-start",
});

const shareTech = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-share-tech",
});

export const metadata: Metadata = {
  title: "DungeonFlip - Web3 Dungeon Crawler on Base",
  description: "Play-to-earn dungeon crawler game on Base blockchain. Battle monsters, collect gems, and win weekly ETH prizes! Built for Seedify Vibe Coins Hackathon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${pressStart.variable} ${shareTech.variable} antialiased min-h-screen`}
        style={{ fontFamily: 'var(--font-press-start)' }}
      >
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
