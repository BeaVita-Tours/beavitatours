import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });
const _inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title:
    "BeaVitaTours - Tours and Day Trips to Dolomites & Prosecco",
  description:
    "Experience the best Tours and Day Trips to the Dolomites, Prosecco wine region, and Italian countryside. Direct booking with no intermediaries.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
