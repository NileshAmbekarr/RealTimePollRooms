import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Real-Time Poll Rooms",
  description:
    "Create instant polls, share a link, and see live results. No accounts needed.",
  keywords: ["poll", "voting", "realtime", "live poll", "survey"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`bg-background-light dark:bg-background-dark font-display text-gray-900 dark:text-gray-100 min-h-screen flex flex-col transition-colors duration-200 font-sans antialiased min-h-screen`}
      >
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
