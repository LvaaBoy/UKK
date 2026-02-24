"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations, TranslationKeys, languageMeta } from "@/locales";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKeys, params?: Record<string, any>) => string;
    languageMeta: typeof languageMeta;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("id");

    useEffect(() => {
        const savedLang = localStorage.getItem("language") as Language;
        if (savedLang && translations[savedLang]) {
            setLanguageState(savedLang);
        } else {
            // Auto-detect browser language
            const browserLang = navigator.language.split("-")[0] as Language;
            if (translations[browserLang]) {
                setLanguageState(browserLang);
            }
        }
    }, []);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem("language", lang);
    };

    const t = (key: TranslationKeys, params?: Record<string, any>): string => {
        let text = (translations[language][key] as string) || (translations.en[key] as string) || key;
        if (params) {
            Object.entries(params).forEach(([k, v]) => {
                text = text.replace(`{{${k}}}`, String(v));
            });
        }
        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, languageMeta }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
