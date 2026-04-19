import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AppToaster } from "@/components/system/AppToaster";

export const metadata: Metadata = {
  title: "LiveKit Agents Control",
  description: "Operations console for voice agents, workers, and observability",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0a0b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-[100dvh] antialiased">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
