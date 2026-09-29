"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
    // Default theme
    const [mode, setMode] = useState("dark");

    const [mounted, setMounted] = useState(false);

    /* ============================================
       LOAD THEME FROM LOCAL STORAGE
    ============================================ */
    useEffect(() => {
        try {
            const savedMode = localStorage.getItem("themeMode");

            if (savedMode === "light" || savedMode === "dark") {
                setMode(savedMode);
            }
        } catch (error) {
            console.error("Failed to load theme:", error);
        }

        setMounted(true);
    }, []);

    /* ============================================
       APPLY THEME
    ============================================ */
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;

        root.classList.remove("light", "dark");
        root.classList.add(mode);

        /* ========================================
           BLACK & WHITE CODEMENTOR THEME
        ======================================== */

        if (mode === "dark") {
            // Background
            root.style.setProperty("--background", "#090909");
            root.style.setProperty("--foreground", "#FFFFFF");

            // Cards / surfaces
            root.style.setProperty("--surface", "#111111");
            root.style.setProperty("--surface-light", "#181818");
            root.style.setProperty("--surface-hover", "#202020");

            // Borders
            root.style.setProperty("--border", "#2A2A2A");
            root.style.setProperty("--border-light", "#353535");

            // Text
            root.style.setProperty("--text-primary", "#FFFFFF");
            root.style.setProperty("--text-secondary", "#A1A1AA");
            root.style.setProperty("--text-muted", "#71717A");

            // Brand
            root.style.setProperty("--theme-color", "#FFFFFF");
            root.style.setProperty("--theme-dark-color", "#000000");

            // Buttons
            root.style.setProperty("--button-bg", "#FFFFFF");
            root.style.setProperty("--button-text", "#000000");

            // Code editor
            root.style.setProperty("--editor-bg", "#0D0D0D");
            root.style.setProperty("--editor-border", "#292929");
        }

        if (mode === "light") {
            // Background
            root.style.setProperty("--background", "#FFFFFF");
            root.style.setProperty("--foreground", "#090909");

            // Cards / surfaces
            root.style.setProperty("--surface", "#F7F7F7");
            root.style.setProperty("--surface-light", "#F1F1F1");
            root.style.setProperty("--surface-hover", "#E9E9E9");

            // Borders
            root.style.setProperty("--border", "#E2E2E2");
            root.style.setProperty("--border-light", "#D4D4D4");

            // Text
            root.style.setProperty("--text-primary", "#090909");
            root.style.setProperty("--text-secondary", "#525252");
            root.style.setProperty("--text-muted", "#737373");

            // Brand
            root.style.setProperty("--theme-color", "#000000");
            root.style.setProperty("--theme-dark-color", "#FFFFFF");

            // Buttons
            root.style.setProperty("--button-bg", "#000000");
            root.style.setProperty("--button-text", "#FFFFFF");

            // Code editor
            root.style.setProperty("--editor-bg", "#F8F8F8");
            root.style.setProperty("--editor-border", "#D4D4D4");
        }

        localStorage.setItem("themeMode", mode);
    }, [mode, mounted]);

    /* ============================================
       TOGGLE DARK / LIGHT
    ============================================ */
    const toggleMode = () => {
        setMode((previous) =>
            previous === "dark" ? "light" : "dark"
        );
    };

    /* ============================================
       SET SPECIFIC MODE
    ============================================ */
    const setTheme = (theme) => {
        if (theme === "dark" || theme === "light") {
            setMode(theme);
        }
    };

    /* ============================================
       RESET THEME
    ============================================ */
    const resetTheme = () => {
        setMode("dark");
    };

    /* ============================================
       BACKEND THEME SUPPORT
    ============================================ */
    const applyBackendTheme = (theme) => {
        if (!theme) return;

        if (
            theme.mode === "dark" ||
            theme.mode === "light"
        ) {
            setMode(theme.mode);
        }
    };

    /* ============================================
       PROVIDER
    ============================================ */
    return (
        <ThemeContext.Provider
            value={{
                mode,

                // Main functions
                toggleMode,
                setTheme,
                resetTheme,
                applyBackendTheme,

                // Backward compatibility
                theme: mode,
                toggleTheme: toggleMode,

                mounted,
            }}
        >
            {mounted ? children : null}
        </ThemeContext.Provider>
    );
}

/* ============================================
   USE THEME
============================================ */
export function useTheme() {
    const context = useContext(ThemeContext);

    if (!context) {
        throw new Error(
            "useTheme must be used inside ThemeProvider"
        );
    }

    return context;
}