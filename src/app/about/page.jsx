// app/about/page.jsx
"use client";

import Navbar from "@/components/landing/Navbar";
import { useTheme } from "@/context/ThemeContext";
import { useRouter } from "next/navigation";
import {
  FaArrowRight,
  FaCheckCircle,
  FaCode,
  FaLightbulb,
  FaMicrophone,
  FaRobot,
  FaRocket,
} from "react-icons/fa";

export default function AboutPage() {
  const { mode } = useTheme();
  const router = useRouter();

  const isDark = mode === "dark";

  return (
    <main
      className="min-h-screen transition-colors duration-300"
      style={{
        backgroundColor: isDark ? "#09090f" : "#f8f9fc",
        color: isDark ? "#ffffff" : "#111827",
      }}
    >
      <Navbar />

      {/* =========================
          PAGE CONTENT
      ========================== */}
      <section className="relative overflow-hidden pt-28 pb-16 sm:pt-32 sm:pb-20">
        {/* Subtle background decoration */}
        <div
          className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
          style={{
            background: isDark
              ? "rgba(99, 102, 241, 0.18)"
              : "rgba(99, 102, 241, 0.10)",
          }}
        />

        <div className="relative mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
          {/* =========================
              HERO
          ========================== */}
          <div className="mx-auto max-w-3xl text-center">
            <div
              className={`mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${isDark
                ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
                : "border-indigo-200 bg-indigo-50 text-indigo-600"
                }`}
            >
              <FaRobot className="text-indigo-500" />
              AI-Powered Coding Platform
            </div>

            <h1
              className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${isDark ? "text-white" : "text-gray-900"
                }`}
            >
              About{" "}
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                CodeMentor AI
              </span>
            </h1>

            <p
              className={`mx-auto mt-6 max-w-2xl text-base leading-7 sm:text-lg ${isDark ? "text-gray-400" : "text-gray-600"
                }`}
            >
              A smart coding companion designed to help developers understand
              code, solve problems, fix errors, and learn programming through
              an interactive AI-powered experience.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                onClick={() => router.push("/problem-solver")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-indigo-500/30 sm:w-auto"
              >
                Try CodeMentor AI
                <FaArrowRight size={13} />
              </button>

              <button
                onClick={() => router.push("/pricing")}
                className={`inline-flex w-full items-center justify-center rounded-xl border px-6 py-3 text-sm font-semibold transition sm:w-auto ${isDark
                  ? "border-gray-700 bg-gray-900 text-gray-200 hover:border-indigo-500 hover:text-indigo-400"
                  : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:text-indigo-600"
                  }`}
              >
                View Pricing
              </button>
            </div>
          </div>

          {/* =========================
              DIVIDER
          ========================== */}
          <div
            className={`mx-auto my-16 h-px max-w-4xl ${isDark ? "bg-gray-800" : "bg-gray-200"
              }`}
          />

          {/* =========================
              OUR VISION
          ========================== */}
          <section className="mb-16">
            <div
              className={`rounded-2xl border p-6 sm:p-8 lg:p-10 ${isDark
                ? "border-gray-800 bg-[#111118]"
                : "border-gray-200 bg-white shadow-sm"
                }`}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
                  <FaRocket className="text-lg text-white" />
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-indigo-500">
                    Our Vision
                  </p>

                  <h2
                    className={`text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-gray-900"
                      }`}
                  >
                    Making coding easier to understand
                  </h2>

                  <p
                    className={`mt-4 text-base leading-7 ${isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    CodeMentor AI combines artificial intelligence with
                    interactive learning to create a more accessible coding
                    experience. The goal is to help developers understand
                    their mistakes, improve their skills, and learn at their
                    own pace.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* =========================
              FEATURES
          ========================== */}
          <section className="mb-16">
            <div className="mb-8 text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
                What We Offer
              </p>

              <h2
                className={`mt-2 text-3xl font-bold sm:text-4xl ${isDark ? "text-white" : "text-gray-900"
                  }`}
              >
                Built for developers
              </h2>

              <p
                className={`mx-auto mt-3 max-w-2xl ${isDark ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                Tools designed to make programming practice more interactive,
                understandable, and productive.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Card 1 */}
              <FeatureCard
                isDark={isDark}
                icon={<FaCode />}
                iconClass="bg-indigo-600"
                title="AI-Powered Code Fixes"
                description="Get help identifying coding errors and understand why they occur. CodeMentor AI can provide corrected code along with explanations."
              />

              {/* Card 2 */}
              <FeatureCard
                isDark={isDark}
                icon={<FaMicrophone />}
                iconClass="bg-violet-600"
                title="Voice-Enabled Learning"
                description="Learn through a conversational experience with voice-enabled assistance that can explain programming concepts step by step."
              />

              {/* Card 3 */}
              <FeatureCard
                isDark={isDark}
                icon={<FaRobot />}
                iconClass="bg-blue-600"
                title="AI Coding Assistant"
                description="Ask questions about programming, debugging, syntax, concepts, and development workflows through an interactive AI assistant."
              />

              {/* Card 4 */}
              <FeatureCard
                isDark={isDark}
                icon={<FaLightbulb />}
                iconClass="bg-purple-600"
                title="Personalized Learning"
                description="Follow learning paths based on your goals and experience while practicing concepts through real coding examples."
              />
            </div>
          </section>

          {/* =========================
              HOW IT WORKS
          ========================== */}
          <section className="mb-16">
            <div
              className={`rounded-2xl border p-6 sm:p-8 ${isDark
                ? "border-gray-800 bg-[#111118]"
                : "border-gray-200 bg-white shadow-sm"
                }`}
            >
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
                  Simple Workflow
                </p>

                <h2
                  className={`mt-2 text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-gray-900"
                    }`}
                >
                  Learn, practice, improve
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Step
                  number="01"
                  title="Write Code"
                  description="Practice your programming skills using the coding environment."
                  isDark={isDark}
                />

                <Step
                  number="02"
                  title="Ask AI"
                  description="Use CodeMentor AI to understand errors, concepts, or coding problems."
                  isDark={isDark}
                />

                <Step
                  number="03"
                  title="Keep Learning"
                  description="Understand the solution and continue improving your programming skills."
                  isDark={isDark}
                />
              </div>
            </div>
          </section>

          {/* =========================
              WHY CODEMENTOR
          ========================== */}
          <section className="mb-16">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
                  Why CodeMentor?
                </p>

                <h2
                  className={`mt-2 text-3xl font-bold sm:text-4xl ${isDark ? "text-white" : "text-gray-900"
                    }`}
                >
                  More than just a code editor
                </h2>

                <p
                  className={`mt-4 leading-7 ${isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  CodeMentor AI focuses on helping developers understand the
                  reasoning behind their code instead of simply providing an
                  answer.
                </p>
              </div>

              <div
                className={`rounded-2xl border p-6 ${isDark
                  ? "border-gray-800 bg-[#111118]"
                  : "border-gray-200 bg-white shadow-sm"
                  }`}
              >
                <div className="space-y-4">
                  {[
                    "Understand coding errors",
                    "Practice programming concepts",
                    "Get AI-powered explanations",
                    "Learn at your own pace",
                    "Explore different technologies",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <FaCheckCircle className="shrink-0 text-indigo-500" />

                      <span
                        className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* =========================
              TEAM
          ========================== */}
          <section className="mb-16">
            <div
              className={`rounded-2xl border p-6 sm:p-8 ${isDark
                ? "border-gray-800 bg-[#111118]"
                : "border-gray-200 bg-white shadow-sm"
                }`}
            >
              <div className="mb-8 text-center">
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
                  The Team
                </p>

                <h2
                  className={`mt-2 text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-gray-900"
                    }`}
                >
                  Created By
                </h2>

                <p
                  className={`mt-3 ${isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                >
                  Built by Paras Varankar with a passion for technology
                  and coding education.
                </p>
              </div>

              <div className="mx-auto grid max-w-sm grid-cols-1 gap-3">
                {["Paras Varankar"].map((name) => (
                  <div
                    key={name}
                    className={`rounded-xl border p-4 text-center transition ${isDark
                      ? "border-gray-800 bg-[#0c0c12] hover:border-indigo-500/40"
                      : "border-gray-200 bg-gray-50 hover:border-indigo-300"
                      }`}
                  >
                    <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                      <FaCode />
                    </div>

                    <p
                      className={`text-sm font-semibold ${isDark ? "text-gray-200" : "text-gray-800"
                        }`}
                    >
                      {name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* =========================
              HACKATHON / CTA
          ========================== */}
          <section className="text-center">
            <div
              className={`rounded-2xl border p-8 sm:p-10 ${isDark
                ? "border-indigo-500/20 bg-indigo-500/5"
                : "border-indigo-100 bg-indigo-50/70"
                }`}
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600">
                <FaRocket className="text-white" />
              </div>

              <h2
                className={`mt-5 text-2xl font-bold sm:text-3xl ${isDark ? "text-white" : "text-gray-900"
                  }`}
              >
                Ready to start coding?
              </h2>

              <p
                className={`mx-auto mt-3 max-w-xl ${isDark ? "text-gray-400" : "text-gray-600"
                  }`}
              >
                Explore CodeMentor AI and start building, practicing, and
                learning with an AI-powered coding companion.
              </p>

              <button
                onClick={() => router.push("/problem-solver")}
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:-translate-y-0.5"
              >
                Start Coding
                <FaArrowRight size={13} />
              </button>
            </div>

            <p
              className={`mt-8 text-xs ${isDark ? "text-gray-600" : "text-gray-400"
                }`}
            >
              © 2026 Paras Varankar. All rights reserved.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}

/* =========================================
   FEATURE CARD
========================================= */

function FeatureCard({
  isDark,
  icon,
  iconClass,
  title,
  description,
}) {
  return (
    <div
      className={`group rounded-2xl border p-6 transition-all duration-200 ${isDark
        ? "border-gray-800 bg-[#111118] hover:border-indigo-500/40"
        : "border-gray-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md"
        }`}
    >
      <div
        className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${iconClass} text-white shadow-lg`}
      >
        {icon}
      </div>

      <h3
        className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"
          }`}
      >
        {title}
      </h3>

      <p
        className={`mt-3 text-sm leading-6 ${isDark ? "text-gray-400" : "text-gray-600"
          }`}
      >
        {description}
      </p>
    </div>
  );
}

/* =========================================
   STEP
========================================= */

function Step({ number, title, description, isDark }) {
  return (
    <div className="relative">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm font-bold text-indigo-500">{number}</span>

        <div
          className={`h-px flex-1 ${isDark ? "bg-gray-800" : "bg-gray-200"
            }`}
        />
      </div>

      <h3
        className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"
          }`}
      >
        {title}
      </h3>

      <p
        className={`mt-2 text-sm leading-6 ${isDark ? "text-gray-400" : "text-gray-600"
          }`}
      >
        {description}
      </p>
    </div>
  );
}