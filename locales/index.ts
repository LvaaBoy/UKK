import en, { TranslationKeys } from "./en";
import id from "./id";
import es from "./es";
import fr from "./fr";
import jp from "./jp";

export type Language = "en" | "id" | "es" | "fr" | "jp";

export const translations: Record<Language, typeof en> = { en, id, es, fr, jp };

export const languageMeta: Record<Language, { flag: string; nativeName: string; name: string }> = {
    en: { flag: "🇬🇧", nativeName: "English", name: "English" },
    id: { flag: "🇮🇩", nativeName: "Bahasa Indonesia", name: "Indonesian" },
    es: { flag: "🇪🇸", nativeName: "Español", name: "Spanish" },
    fr: { flag: "🇫🇷", nativeName: "Français", name: "French" },
    jp: { flag: "🇯🇵", nativeName: "日本語", name: "Japanese" },
};

export type { TranslationKeys };
