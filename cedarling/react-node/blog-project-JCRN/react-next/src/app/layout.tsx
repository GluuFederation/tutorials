"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense, useEffect } from "react";
import {
  cedarlingBootstrapProperties,
  cedarlingClient,
} from "@/factories/cedarlingUtils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    cedarlingClient
      .initialize(cedarlingBootstrapProperties)
      .catch(console.error);
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Suspense>{children}</Suspense>
      </body>
    </html>
  );
}
