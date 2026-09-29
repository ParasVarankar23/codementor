"use client";

import { GitBranch, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-[var(--border)] px-6 py-16">
            <div className="mx-auto max-w-7xl">
                <div className="grid gap-12 md:grid-cols-5">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                                <Sparkles size={20} />
                            </div>

                            <span className="text-xl font-bold">
                                Code<span className="text-indigo-500">Mentor</span>
                            </span>
                        </Link>

                        <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--muted)]">
                            Your AI-powered coding mentor for learning,
                            debugging, practicing, and building better
                            software.
                        </p>

                        <p className="mt-6 text-sm text-[var(--muted)]">
                            © 2026 CodeMentor AI. All rights reserved.
                        </p>
                    </div>

                    <FooterColumn
                        title="Company"
                        links={["About", "Careers"]}
                    />

                    <FooterColumn
                        title="Product"
                        links={["Features", "Pricing"]}
                    />

                    <FooterColumn
                        title="Resources"
                        links={["Docs", "Community", "Blog"]}
                    />
                </div>

                <div className="mt-12 flex items-center justify-between border-t border-[var(--border)] pt-6">
                    <div className="flex gap-5">
                        <Link href="#" className="text-[var(--muted)] hover:text-indigo-500">
                            Privacy
                        </Link>

                        <Link href="#" className="text-[var(--muted)] hover:text-indigo-500">
                            Terms
                        </Link>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href="#"
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:text-indigo-500"
                        >
                            <GitBranch size={18} />
                        </a>

                        <a
                            href="#"
                            className="rounded-lg border border-[var(--border)] p-2 text-[var(--muted)] hover:text-indigo-500"
                        >
                            <UsersRound size={18} />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterColumn({ title, links }) {
    return (
        <div>
            <h3 className="font-semibold">{title}</h3>

            <div className="mt-5 space-y-3">
                {links.map((link) => (
                    <Link
                        key={link}
                        href="#"
                        className="block text-sm text-[var(--muted)] transition hover:text-indigo-500"
                    >
                        {link}
                    </Link>
                ))}
            </div>
        </div>
    );
}