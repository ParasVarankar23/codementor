"use client";

import {
    Heart,
    Smile,
    BarChart3,
    Users,
} from "lucide-react";

export default function StudentInsights() {
    return (
        <section className="px-6 py-28">
            <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
                {/* Text */}
                <div>
                    <div
                        className="
              mb-6 inline-flex rounded-full
              border border-cyan-500/30
              bg-cyan-500/10 px-5 py-2
              text-sm tracking-[0.2em]
              text-cyan-500
            "
                    >
                        STUDENT INSIGHTS
                    </div>

                    <h2 className="text-5xl font-black leading-tight">
                        Enhanced{" "}
                        <span className="text-cyan-500">
                            Learning
                        </span>

                        <br />

                        <span className="text-indigo-500">
                            Experience
                        </span>
                    </h2>

                    <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
                        Track your improvement journey and coding mastery
                        with personalized insights and progress analytics.
                    </p>

                    <div className="mt-8 space-y-5">
                        <Feature icon={Heart} text="Personalized Learning Paths" />
                        <Feature icon={Smile} text="Confidence Tracking" />
                        <Feature icon={BarChart3} text="Skill Progress Analytics" />
                        <Feature icon={Users} text="Peer Comparison Metrics" />
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-3">
                        <Stat value="95%" label="Satisfaction" />
                        <Stat value="10K+" label="Students" />
                        <Stat value="4.9★" label="Rating" />
                    </div>
                </div>

                {/* Dashboard */}
                <div
                    className="
            rounded-3xl border border-[var(--border)]
            bg-[var(--card)] p-8
            shadow-2xl shadow-cyan-500/10
          "
                >
                    <p className="text-[var(--muted)]">
                        Student Progress
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                        Confidence Distribution
                    </h3>

                    <div className="mx-auto mt-10 flex h-64 w-64 items-center justify-center rounded-full border-[18px] border-indigo-500">
                        <div className="text-center">
                            <div className="text-5xl font-black">
                                70%
                            </div>

                            <div className="mt-2 text-sm text-[var(--muted)]">
                                Confidence
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-3 text-center">
                        <ProgressStat
                            value="70%"
                            label="Confident"
                            color="text-indigo-500"
                        />

                        <ProgressStat
                            value="20%"
                            label="Improved"
                            color="text-violet-500"
                        />

                        <ProgressStat
                            value="10%"
                            label="Practice"
                            color="text-cyan-500"
                        />
                    </div>

                    <div className="mt-8">
                        <div className="mb-2 flex justify-between">
                            <span className="text-sm text-[var(--muted)]">
                                Overall Mastery
                            </span>

                            <span className="font-semibold">
                                70%
                            </span>
                        </div>

                        <div className="h-2 rounded-full bg-[var(--border)]">
                            <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500" />
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

function Stat({ value, label }) {
    return (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 text-center">
            <div className="text-xl font-bold text-indigo-500">
                {value}
            </div>

            <div className="mt-1 text-xs text-[var(--muted)]">
                {label}
            </div>
        </div>
    );
}

function ProgressStat({ value, label, color }) {
    return (
        <div>
            <div className={`text-xl font-bold ${color}`}>
                {value}
            </div>

            <div className="mt-1 text-xs text-[var(--muted)]">
                {label}
            </div>
        </div>
    );
}