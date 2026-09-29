"use client";

import {
    Bug,
    Mic,
    BarChart3,
    ArrowUpRight,
} from "lucide-react";

const features = [
    {
        icon: Bug,
        title: "Live Code Debugging",
        description:
            "Analyze your code and identify syntax, logic, and runtime problems instantly.",
    },
    {
        icon: Mic,
        title: "Voice AI Tutor",
        description:
            "Ask questions naturally and learn programming with interactive AI conversations.",
    },
    {
        icon: BarChart3,
        title: "Skill Progress System",
        description:
            "Track your programming skills and follow a personalized learning roadmap.",
    },
];

export default function FeaturesSection() {
    return (
        <section id="features" className="px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <div className="mx-auto max-w-3xl text-center">
                    <div
                        className="
              mb-5 inline-flex rounded-full
              border border-indigo-500/30
              bg-indigo-500/10 px-5 py-2
              text-sm font-medium tracking-[0.2em]
              text-indigo-500
            "
                    >
                        SMART LEARNING SYSTEM
                    </div>

                    <h2 className="text-4xl font-bold sm:text-5xl">
                        Learn, Debug & Build Smarter
                    </h2>

                    <p className="mt-5 text-lg text-[var(--muted)]">
                        Your personal AI tutor that explains, corrects,
                        and improves your code step-by-step.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 md:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon;

                        return (
                            <div
                                key={feature.title}
                                className="
                  group rounded-3xl
                  border border-[var(--border)]
                  bg-[var(--card)]
                  p-8
                  transition duration-300
                  hover:-translate-y-2
                  hover:border-indigo-500/50
                  hover:shadow-2xl
                  hover:shadow-indigo-500/10
                "
                            >
                                <div
                                    className="
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl bg-indigo-500/10
                    text-indigo-500
                    transition group-hover:bg-indigo-500
                    group-hover:text-white
                  "
                                >
                                    <Icon size={25} />
                                </div>

                                <h3 className="mt-7 text-xl font-bold">
                                    {feature.title}
                                </h3>

                                <p className="mt-4 leading-7 text-[var(--muted)]">
                                    {feature.description}
                                </p>

                                <div className="mt-6 flex items-center gap-2 text-sm font-medium text-indigo-500">
                                    Explore feature
                                    <ArrowUpRight size={16} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}