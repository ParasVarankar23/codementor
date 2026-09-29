"use client";

import Link from "next/link";

import CodeMentorLogo from "./CodeMentorLogo";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
    return (
        <header className="fixed left-1/2 top-5 z-50 w-[calc(100%-32px)] max-w-7xl -translate-x-1/2">
            <nav
                className="
                    flex h-16
                    items-center justify-between
                    rounded-2xl
                    border border-zinc-800
                    bg-zinc-950/85
                    px-5
                    shadow-2xl
                    backdrop-blur-xl

                    light:border-zinc-200
                    light:bg-white/90
                "
            >
                <CodeMentorLogo />

                <div className="hidden items-center gap-8 md:flex">
                    <NavLink href="#features">
                        About
                    </NavLink>

                    <NavLink href="#practice">
                        Practice
                    </NavLink>

                    <NavLink href="#roadmap">
                        RoadMap
                    </NavLink>

                    <NavLink href="#pricing">
                        Pricing
                    </NavLink>
                </div>

                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    <Link
                        href="/login"
                        className="
                            rounded-xl
                            bg-white
                            px-5 py-2.5
                            text-sm font-semibold
                            text-black
                            transition
                            hover:bg-zinc-200

                            light:bg-black
                            light:text-white
                            light:hover:bg-zinc-800
                        "
                    >
                        Sign In
                    </Link>
                </div>
            </nav>
        </header>
    );
}

function NavLink({ href, children }) {
    return (
        <Link
            href={href}
            className="
                text-sm font-medium
                text-zinc-400
                transition
                hover:text-white

                light:text-zinc-600
                light:hover:text-black
            "
        >
            {children}
        </Link>
    );
}