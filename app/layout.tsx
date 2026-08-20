import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

// TODO: Cache Components adoption. Refactor this route so this opt-out can be removed.
// See: https://nextjs.org/docs/app/guides/migrating-to-cache-components
export const instant = false;

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
