import { ThemeProvider } from "@/context/ThemeContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CodeMentor AI",
  description:
    "CodeMentor AI is an AI-powered coding platform that helps students learn, practice, debug, and improve their programming skills.",
  keywords: [
    "CodeMentor AI",
    "AI Coding Assistant",
    "Learn Programming",
    "Coding Practice",
    "AI Developer",
    "Programming Roadmap",
    "Code Editor",
  ],
  authors: [{ name: "CodeMentor AI" }],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}