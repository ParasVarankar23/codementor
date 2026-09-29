"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle() {
    const { mode, toggleMode, mounted } = useTheme();

    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-xl border border-zinc-800" />
        );
    }

    return (
        <button
            onClick={toggleMode}
            className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                border border-zinc-800
                bg-zinc-900
                text-zinc-300
                transition

                hover:bg-zinc-800

                light:border-zinc-200
                light:bg-white
                light:text-zinc-700
                light:hover:bg-zinc-100
            "
            aria-label="Toggle theme"
        >
            {mode === "dark" ? (
                <Sun size={18} />
            ) : (
                <Moon size={18} />
            )}
        </button>
    );
}