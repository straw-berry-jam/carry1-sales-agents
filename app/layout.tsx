import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

export const metadata: Metadata = {
  title: "CARRY1 Sales Coach | Master Every Sales Pitch",
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
      <body className={`${montserrat.className} bg-textured-gradient`}>
        {children}
      </body>
    </html>
  );
}
