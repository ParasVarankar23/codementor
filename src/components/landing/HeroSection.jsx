"use client";

import { ArrowRight, Code2, Mic, Sparkles } from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
    return (
        <section
            id="about"
            className="
        relative flex min-h-screen items-center
        justify-center overflow-hidden
        px-6 pt-28
      "
        >
            {/* Background */}
            <div className="absolute inset-0 -z-10">
                <div
                    className="
            absolute left-1/2 top-20
            h-[500px] w-[500px]
            -translate-x-1/2 rounded-full
            bg-indigo-500/10 blur-[130px]
          "
                />

                <div
                    className="
            absolute right-0 top-1/3
            h-[350px] w-[350px]
            rounded-full bg-violet-500/10
            blur-[120px]
          "
                />
            </div>

            <div className="mx-auto max-w-7xl text-center">
                {/* Badge */}
                <div
                    className="
            mx-auto mb-8 inline-flex items-center gap-2
            rounded-full border border-indigo-500/30
            bg-indigo-500/10 px-5 py-2
            text-sm font-medium text-indigo-500
          "
                >
                    <Sparkles size={15} />
                    AI CODE MENTOR
                </div>

                {/* Heading */}
                <h1
                    className="
            text-4xl font-black leading-[1.05]
            tracking-tight sm:text-5xl md:text-6xl
            lg:text-7xl
          "
                >
                    Transform Your
                    <br />

                    <span className="text-[var(--foreground)]">
                        Coding Journey Into
                    </span>

                    <br />

                    <span
                        className="
              bg-gradient-to-r
              from-indigo-500 via-violet-500 to-cyan-500
              bg-clip-text text-transparent
            "
                    >
                        Interactive Learning
                    </span>
                </h1>

                {/* Description */}
                <p
                    className="
            mx-auto mt-8 max-w-3xl
            text-lg leading-8 text-[var(--muted)]
            sm:text-xl
          "
                >
                    An AI-powered coding mentor that helps you debug,
                    learn, practice, and improve your code in real-time
                    with intelligent explanations.
                </p>

                {/* Buttons */}
                <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                    <Link
                        href="/editor"
                        className="
              group flex items-center justify-center gap-2
              rounded-xl bg-gradient-to-r
              from-indigo-600 to-violet-600
              px-7 py-4 font-semibold text-white
              shadow-xl shadow-indigo-500/20
              transition hover:-translate-y-0.5
            "
                    >
                        <Code2 size={19} />
                        Start Coding Free
                        <ArrowRight
                            size={18}
                            className="transition group-hover:translate-x-1"
                        />
                    </Link>

                    <Link
                        href="#features"
                        className="
              flex items-center justify-center gap-2
              rounded-xl border border-[var(--border)]
              bg-[var(--card)]
              px-7 py-4 font-semibold
              transition hover:border-indigo-500
            "
                    >
                        <Mic size={18} className="text-indigo-500" />
                        Start Learning
                    </Link>
                </div>

                {/* Trust */}
                <div className="mt-12 flex items-center justify-center gap-2 text-sm text-[var(--muted)]">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    AI-powered learning • Real-time assistance
                </div>
            </div>
        </section>
    );
}