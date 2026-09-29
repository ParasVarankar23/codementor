"use client";

import {
    Bug,
    Rocket,
    Activity,
    Zap,
} from "lucide-react";

export default function LearningEfficiency() {
    return (
        <section className="px-6 py-28">
            <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
                {/* Analytics Card */}
                <div
                    className="
            rounded-3xl border border-[var(--border)]
            bg-[var(--card)] p-8
            shadow-2xl shadow-violet-500/10
          "
                >
                    <div className="flex justify-between">
                        <div>
                            <p className="text-[var(--muted)]">
                                Performance Metrics
                            </p>

                            <h3 className="mt-2 text-2xl font-bold">
                                Code Efficiency
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-violet-500 p-4 text-white">
                            <Zap size={24} />
                        </div>
                    </div>

                    {/* Chart */}
                    <div className="mt-12 flex h-44 items-end justify-center gap-14">
                        <div className="h-24 w-20 rounded-t-xl bg-indigo-500" />
                        <div className="h-36 w-20 rounded-t-xl bg-violet-500" />
                        <div className="h-44 w-20 rounded-t-xl bg-cyan-500" />
                    </div>

                    <Metric
                        icon={Rocket}
                        title="Automated Refactor"
                        value="84% faster"
                        progress="84%"
                    />

                    <Metric
                        icon={Bug}
                        title="Error Detection"
                        value="+42%"
                        progress="72%"
                        green
                    />

                    <p className="mt-6 text-sm text-[var(--muted)]">
                        ● Live performance tracking • Updated in real-time
                    </p>
                </div>

                {/* Content */}
                <div>
                    <div
                        className="
              mb-6 inline-flex rounded-full
              border border-violet-500/30
              bg-violet-500/10 px-5 py-2
              text-sm tracking-[0.2em]
              text-violet-500
            "
                    >
                        AUTOMATED LEARNING
                    </div>

                    <h2 className="text-5xl font-black leading-tight">
                        Accelerated{" "}
                        <span className="text-violet-500">
                            Learning
                        </span>

                        <br />

                        <span className="text-indigo-500">
                            Efficiency
                        </span>
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                        Spend less time stuck. Learn faster with
                        intelligent guidance, live correction, and
                        AI-powered recommendations.
                    </p>

                    <div className="mt-8 space-y-5">
                        <Feature icon={Bug} text="Automated Error Detection" />
                        <Feature icon={Rocket} text="Live Refactoring Suggestions" />
                        <Feature icon={Activity} text="Performance Analytics" />
                    </div>

                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                            <div className="text-3xl font-bold text-indigo-500">
                                10x
                            </div>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                Faster Learning
                            </p>
                        </div>

                        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
                            <div className="text-3xl font-bold text-violet-500">
                                24/7
                            </div>
                            <p className="mt-1 text-sm text-[var(--muted)]">
                                AI Availability
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Feature({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
                <Icon size={20} />
            </div>

            <span className="font-medium">{text}</span>
        </div>
    );
}

function Metric({
    icon: Icon,
    title,
    value,
    progress,
    green,
}) {
    return (
        <div
            className="
        mt-5 rounded-2xl border
        border-[var(--border)]
        bg-[var(--background)]
        p-4
      "
        >
            <div className="flex items-center gap-3">
                <Icon
                    size={19}
                    className={green ? "text-emerald-500" : "text-indigo-500"}
                />

                <span className="flex-1 font-medium">{title}</span>

                <span
                    className={
                        green
                            ? "font-bold text-emerald-500"
                            : "font-bold text-indigo-500"
                    }
                >
                    {value}
                </span>
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-[var(--border)]">
                <div
                    className={
                        green
                            ? "h-full rounded-full bg-emerald-500"
                            : "h-full rounded-full bg-indigo-500"
                    }
                    style={{ width: progress }}
                />
            </div>
        </div>
    );
}