"use client";

import {
    ArrowRight,
    Mic,
    Rocket,
} from "lucide-react";
import Link from "next/link";

export default function CTASection() {
    return (
        <section className="px-6 py-28">
            <div
                className="
          relative mx-auto max-w-6xl overflow-hidden
          rounded-[2rem] border border-indigo-500/20
          bg-gradient-to-br
          from-indigo-500/10
          via-violet-500/10
          to-cyan-500/10
          px-6 py-20 text-center
        "
            >
                <div className="absolute left-1/2 top-0 h-60 w-60 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />

                <div className="relative">
                    <div
                        className="
              mx-auto mb-6 inline-flex
              rounded-full border border-indigo-500/30
              bg-indigo-500/10 px-5 py-2
              text-sm tracking-[0.2em]
              text-indigo-500
            "
                    >
                        START YOUR CODING JOURNEY TODAY
                    </div>

                    <h2 className="mx-auto max-w-4xl text-4xl font-black leading-tight sm:text-6xl">
                        Unlock the power of{" "}
                        <span className="text-indigo-500">
                            AI mentorship
                        </span>{" "}
                        and master programming faster.
                    </h2>

                    <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
                        <Link
                            href="/problem-solver"
                            className="
                flex items-center justify-center gap-2
                rounded-xl bg-gradient-to-r
                from-indigo-600 to-violet-600
                px-7 py-4 font-semibold text-white
                shadow-xl shadow-indigo-500/20
              "
                        >
                            <Rocket size={19} />
                            Start Coding Free
                            <ArrowRight size={18} />
                        </Link>

                        <Link
                            href="/roadmap"
                            className="
                flex items-center justify-center gap-2
                rounded-xl border border-[var(--border)]
                bg-[var(--card)]
                px-7 py-4 font-semibold
              "
                        >
                            <Mic size={18} className="text-indigo-500" />
                            Start Learning
                        </Link>
                    </div>

                    <p className="mt-7 text-sm text-[var(--muted)]">
                        <span className="text-emerald-500">●</span>{" "}
                        No credit card required • Start learning in seconds
                    </p>
                </div>
            </div>
        </section>
    );
}