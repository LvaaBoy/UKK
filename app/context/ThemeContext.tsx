"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark";

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("theme") as Theme | null;
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme: Theme = saved || (prefersDark ? "dark" : "light");
        setThemeState(initialTheme);
        applyTheme(initialTheme);
        setMounted(true);
    }, []);

    const applyTheme = (t: Theme) => {
        const root = document.documentElement;
        if (t === "dark") {
            root.classList.add("dark");
        } else {
            root.classList.remove("dark");
        }
    };

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem("theme", t);
        applyTheme(t);
    };

    const toggleTheme = () => {
        const next: Theme = theme === "light" ? "dark" : "light";
        setTheme(next);
    };

    // Prevent flash of wrong theme
    if (!mounted) return null;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
