import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Freitty", template: "%s · Freitty" },
  description: "Freitty client cabinet — track cross-dock and consolidation orders across hubs.",
  applicationName: "Freitty",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // data-scroll-behavior: Next disables the CSS smooth scrolling during route transitions.
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-dvh antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
