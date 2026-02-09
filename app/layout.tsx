import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SEI Sales Coach | Master Every Sales Pitch",
  description: "Practice sales conversations with AI-powered coaching. Get personalized feedback on discovery, objection handling, and closing—and pitch with confidence.",
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
