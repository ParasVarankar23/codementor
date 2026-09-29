"use client";

import {
    Activity,
    Rocket,
    ShieldCheck,
} from "lucide-react";

export default function CodeInsights() {
    return (
        <section className="px-6 py-28">
            <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
                {/* Left */}
                <div>
                    <div
                        className="
              mb-6 inline-flex rounded-full
              border border-indigo-500/30
              bg-indigo-500/10 px-5 py-2
              text-sm tracking-[0.2em]
              text-indigo-500
            "
                    >
                        CODE INSIGHTS
                    </div>

                    <h2 className="text-5xl font-black leading-tight">
                        Smarter Code
                        <br />

                        <span
                            className="
                bg-gradient-to-r
                from-indigo-500 to-violet-500
                bg-clip-text text-transparent
              "
                        >
                            Improvements
                        </span>
                    </h2>

                    <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--muted)]">
                        AI analyzes your logic, structure, performance,
                        and security to suggest better solutions instantly.
                    </p>

                    <div className="mt-8 space-y-5">
                        <Insight
                            icon={Activity}
                            text="Real-time Code Analysis"
                        />

                        <Insight
                            icon={Rocket}
                            text="Performance Optimization"
                        />

                        <Insight
                            icon={ShieldCheck}
                            text="Security Best Practices"
                        />
                    </div>
                </div>

                {/* Right */}
                <div
                    className="
            rounded-3xl border border-[var(--border)]
            bg-[var(--card)] p-8
            shadow-2xl shadow-indigo-500/10
          "
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-[var(--muted)]">
                                Code Quality Score
                            </p>

                            <h3 className="mt-2 text-5xl font-bold">
                                85
                                <span className="text-xl text-indigo-500">
                                    %
                                </span>
                            </h3>
                        </div>

                        <div className="rounded-2xl bg-indigo-500 p-4 text-white">
                            <Activity size={25} />
                        </div>
                    </div>

                    <Score label="Original Code" value="62%" width="62%" />
                    <Score label="Optimized Code" value="85%" width="85%" />
                    <Score label="Best Practice" value="94%" width="94%" />

                    <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-6">
                        <span className="flex items-center gap-2 text-sm text-[var(--muted)]">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            Live Analysis
                        </span>

                        <span className="text-sm font-semibold text-indigo-500">
                            AI Optimization
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Insight({ icon: Icon, text }) {
    return (
        <div className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
                <Icon size={20} />
            </div>

            <span className="font-medium">{text}</span>
        </div>
    );
}

function Score({ label, value, width }) {
    return (
        <div className="mt-8">
            <div className="mb-3 flex justify-between">
                <span className="text-sm text-[var(--muted)]">
                    {label}
                </span>

                <span className="text-sm font-semibold">
                    {value}
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    style={{ width }}
                />
            </div>
        </div>
    );
}