import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEI Interview Coach | Master Every Interview",
  description: "Practice interviews with AI-powered coaching backed by 30+ years of hiring expertise. Get personalized feedback and interview with confidence.",
  keywords: "interview prep, interview practice, AI interview coach, interview coaching, job interview help",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-textured-gradient`}>
        {children}
      </body>
    </html>
  );
}
