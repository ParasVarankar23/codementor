// app/about/page.jsx
"use client";

import Navbar from "@/components/landing/Navbar";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import { FaCode, FaMicrophone, FaRobot, FaRocket } from "react-icons/fa";

export default function AboutPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0B0B0F" }}>
      <Navbar />
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#FF5A1F]/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
      </div>

      {/* Main content */}
      <div className="relative max-w-4xl mt-5 mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-white">About </span>
            <span className="bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] bg-clip-text text-transparent">
              CodeMentor AI
            </span>
          </h1>

          <div className="w-24 h-1 bg-gradient-to-r from-[#FF5A1F] to-transparent mx-auto mb-8"></div>
        </div>

        {/* Project Description */}
        <div className="space-y-8 mb-16">
          <div className="bg-[#1a1c22] rounded-2xl p-8 border border-[#2a2e3a] hover:border-[#FF5A1F]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF5A1F] to-[#d93d0b] flex items-center justify-center">
                <FaRocket className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Our Vision</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              CodeMentor AI is an intelligent coding assistant that combines the power of artificial intelligence
              with voice-enabled learning. We believe that mastering programming should be accessible, interactive,
              and personalized for every developer, regardless of their skill level.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#1a1c22] rounded-2xl p-6 border border-[#2a2e3a] hover:border-[#FF5A1F]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <FaCode className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI-Powered Code Fixes</h3>
              <p className="text-gray-400">
                Get instant fixes for your code with explanations. Our AI analyzes errors and provides
                corrected versions while explaining what went wrong.
              </p>
            </div>

            <div className="bg-[#1a1c22] rounded-2xl p-6 border border-[#2a2e3a] hover:border-[#FF5A1F]/30 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <FaMicrophone className="text-white text-xl" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Voice-Enabled Learning</h3>
              <p className="text-gray-400">
                Learn through natural conversation. Our voice synthesis explains code step by step,
                highlighting relevant lines as you listen.
              </p>
            </div>
          </div>

          <div className="bg-[#1a1c22] rounded-2xl p-8 border border-[#2a2e3a] hover:border-[#FF5A1F]/30 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <FaRobot className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Personalized Learning Paths</h2>
            </div>
            <p className="text-gray-300 leading-relaxed text-lg">
              Every developer's journey is unique. CodeMentor AI creates customized roadmaps based on your goals,
              experience level, and available time. Track your progress, practice with real examples,
              and master new technologies at your own pace.
            </p>
          </div>
        </div>

        {/* Team Section - Simple and Professional */}
        <div className="bg-[#1a1c22] rounded-2xl p-8 border border-[#2a2e3a] mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Created By</h2>

          <div className="grid md:grid-cols-4 gap-4 text-center">
            {[
              "Rishi Urankar",
              "Vivek Kumar Verma",
              "Paras Varankar",
              "Piyush Pandey"
            ].map((name, index) => (
              <div key={index} className="p-4 rounded-xl bg-[#0f1117] border border-[#2a2e3a]">
                <p className="text-white font-semibold">{name}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-500 text-sm">
              Built with passion and dedication to make coding education accessible to everyone.
            </p>
          </div>
        </div>

        {/* Hackathon Note */}
        <div className="text-center">
          <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-[#FF5A1F]/10 to-[#d93d0b]/10 border border-[#FF5A1F]/30">
            <p className="text-gray-300">
              <span className="text-[#FF5A1F] font-semibold">🏆 Hackathon Project</span> — Created in 24 hours with passion and precision
            </p>
          </div>

          <div className="mt-8">
            <button
              onClick={() => router.push("/problem-solver")}
              className="px-8 py-4 bg-gradient-to-r from-[#FF5A1F] to-[#d93d0b] text-white font-bold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <FaRocket />
              Try CodeMentor AI
            </button>
          </div>

          <p className="text-gray-600 text-sm mt-8">
            © 2024 CodeMentor AI. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}