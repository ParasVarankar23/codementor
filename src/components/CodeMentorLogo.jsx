"use client";

import Link from "next/link";
import { Code2 } from "lucide-react";

export default function CodeMentorLogo() {
    return (
        <Link
            href="/"
            className="group flex items-center gap-3"
        >
            <div
                className="
                    flex h-10 w-10
                    items-center justify-center
                    rounded-xl
                    bg-white
                    text-black
                    transition

                    group-hover:scale-105

                    light:bg-black
                    light:text-white
                "
            >
                <Code2 size={21} strokeWidth={2.4} />
            </div>

            <span
                className="
                    text-xl font-bold
                    tracking-tight
                    text-white

                    light:text-black
                "
            >
                CodeMentor
            </span>
        </Link>
    );
}