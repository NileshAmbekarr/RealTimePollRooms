import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
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
        className={`${geist.variable} font-sans antialiased bg-gray-950 text-white min-h-screen`}
      >
        {/* Background gradient */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-indigo-500/8 rounded-full blur-[100px]" />
        </div>

        {/* Content */}
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
