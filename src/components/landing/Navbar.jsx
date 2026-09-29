"use client";

import { useTheme } from "@/context/ThemeContext";
import { Moon, Sparkles, Sun } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
    const { mode, toggleMode } = useTheme();

    return (
        <header className="fixed left-0 right-0 top-0 z-50 px-4 py-4">
            <nav
                className="
          mx-auto flex max-w-7xl items-center justify-between
          rounded-2xl border border-[var(--border)]
          bg-[var(--nav-bg)] px-5 py-3
          shadow-lg backdrop-blur-xl
        "
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div
                        className="
              flex h-10 w-10 items-center justify-center
              rounded-xl bg-gradient-to-br
              from-indigo-500 to-violet-600
              shadow-lg shadow-indigo-500/20
            "
                    >
                        <Sparkles size={21} className="text-white" />
                    </div>

                    <span className="text-xl font-bold tracking-tight">
                        Code<span className="text-indigo-500">Mentor</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden items-center gap-8 md:flex">
                    <Link
                        href="#about"
                        className="text-sm font-medium text-[var(--muted)] transition hover:text-indigo-500"
                    >
                        About
                    </Link>

                    <Link
                        href="#features"
                        className="text-sm font-medium text-[var(--muted)] transition hover:text-indigo-500"
                    >
                        Practice
                    </Link>

                    <Link
                        href="#roadmap"
                        className="text-sm font-medium text-[var(--muted)] transition hover:text-indigo-500"
                    >
                        RoadMap
                    </Link>

                    <Link
                        href="#pricing"
                        className="text-sm font-medium text-[var(--muted)] transition hover:text-indigo-500"
                    >
                        Pricing
                    </Link>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleMode}
                        className="
              flex h-10 w-10 items-center justify-center
              rounded-xl border border-[var(--border)]
              bg-[var(--card)]
              transition hover:border-indigo-500
            "
                        aria-label="Toggle theme"
                    >
                        {mode === "dark" ? (
                            <Sun size={18} className="text-yellow-500" />
                        ) : (
                            <Moon size={18} className="text-indigo-500" />
                        )}
                    </button>

                    <Link
                        href="/signin"
                        className="
              rounded-xl bg-gradient-to-r
              from-indigo-600 to-violet-600
              px-5 py-2.5 text-sm font-semibold text-white
              shadow-lg shadow-indigo-500/20
              transition hover:scale-[1.02]
            "
                    >
                        Sign In
                    </Link>
                </div>
            </nav>
        </header>
    );
}