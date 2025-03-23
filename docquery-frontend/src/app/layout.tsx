import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";
import { FeatureFlagProvider } from "@/components/flagsmith/flagsmith-wrapper";
import { createFlagsmithInstance } from "flagsmith/isomorphic";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocQuery",
  description:
    "Create powerful knowledge bases for LLMs using your markdown documentation.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const flagsmithInstance = createFlagsmithInstance();
  await flagsmithInstance.init({
    environmentID: process.env.NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID || "",
  });
  const serverState = flagsmithInstance.getState();
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FeatureFlagProvider serverState={serverState}>
          {children}
        </FeatureFlagProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
