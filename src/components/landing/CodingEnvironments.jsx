"use client";

import {
    Code2,
    FileCode2,
    Atom,
    ArrowRight,
} from "lucide-react";

const environments = [
    {
        icon: Code2,
        title: "Beginner Playground",
        description:
            "Practice HTML and CSS basics with guided AI hints.",
        points: [
            "HTML5 & CSS3 fundamentals",
            "Live preview",
            "AI hints",
        ],
    },
    {
        icon: FileCode2,
        title: "JavaScript Lab",
        description:
            "Interactive JavaScript debugging and logic building.",
        points: [
            "ES6+ features",
            "Console playground",
            "AI debugging",
        ],
    },
    {
        icon: Atom,
        title: "React / Next Studio",
        description:
            "Build modern applications with live mentor guidance.",
        points: [
            "Component playground",
            "Next.js support",
            "AI pair programming",
        ],
    },
];

export default function CodingEnvironments() {
    return (
        <section id="roadmap" className="px-6 py-28">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <div
                        className="
              mb-5 inline-flex rounded-full
              border border-indigo-500/30
              bg-indigo-500/10 px-5 py-2
              text-sm tracking-[0.2em]
              text-indigo-500
            "
                    >
                        TAKE FULL CONTROL OF YOUR LEARNING
                    </div>

                    <h2 className="text-4xl font-black sm:text-5xl">
                        Ready-to-use{" "}
                        <span className="text-indigo-500">
                            Coding Environments
                        </span>
                    </h2>

                    <p className="mx-auto mt-5 max-w-2xl text-lg text-[var(--muted)]">
                        Practice with structured templates and live
                        AI assistance.
                    </p>
                </div>

                <div className="mt-16 grid gap-6 md:grid-cols-3">
                    {environments.map((environment) => {
                        const Icon = environment.icon;

                        return (
                            <div
                                key={environment.title}
                                className="
                  rounded-3xl border border-[var(--border)]
                  bg-[var(--card)] p-8
                  transition duration-300
                  hover:-translate-y-2
                  hover:border-indigo-500/50
                  hover:shadow-xl hover:shadow-indigo-500/10
                "
                            >
                                <div
                                    className="
                    flex h-14 w-14 items-center justify-center
                    rounded-2xl bg-indigo-500/10
                    text-indigo-500
                  "
                                >
                                    <Icon size={25} />
                                </div>

                                <h3 className="mt-7 text-2xl font-bold">
                                    {environment.title}
                                </h3>

                                <p className="mt-4 text-[var(--muted)]">
                                    {environment.description}
                                </p>

                                <ul className="mt-6 space-y-3">
                                    {environment.points.map((point) => (
                                        <li
                                            key={point}
                                            className="flex items-center gap-3 text-sm text-[var(--muted)]"
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className="
                    mt-8 flex w-full items-center
                    justify-center gap-2 rounded-xl
                    border border-indigo-500/40
                    py-3 font-semibold text-indigo-500
                    transition hover:bg-indigo-500
                    hover:text-white
                  "
                                >
                                    Get Started Free
                                    <ArrowRight size={17} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}