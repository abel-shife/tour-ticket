import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TourPass | Ticket System",
  description: "Secure QR Registration & Verification for Tourism",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden`}>
        {/* Abstract Background Effects */}
        <div className="fixed inset-0 z-[-1]">
          <div className="absolute top-[-5%] left-[-5%] w-[80%] md:w-[40%] h-[40%] bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[80%] md:w-[40%] h-[40%] bg-rose-500/10 blur-[100px] rounded-full" />
        </div>

        {/* Removed Side and Bottom Nav at user request to keep staff routes hidden from tourists */}

        <main className="p-4 md:p-8 pt-8 md:pt-12 max-w-7xl mx-auto w-full min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
