import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    searchPlaceholder: "Search...",
    dashboard: "Dashboard",
    characters: "Characters",
    universes: "Universes",
    knowledgeBase: "Knowledge Base",
    billing: "Billing",
    settings: "Settings",
    help: "Help",
    newBook: "New Book",
    credits: "Credits",
  },
  ar: {
    searchPlaceholder: "بحث...",
    dashboard: "لوحة التحكم",
    characters: "الشخصيات",
    universes: "العوالم",
    knowledgeBase: "قاعدة المعرفة",
    billing: "الفواتير",
    settings: "الإعدادات",
    help: "المساعدة",
    newBook: "كتاب جديد",
    credits: "رصيد",
  },
};

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  isRTL: false,
  t: (key) => key,
});

const STORAGE_KEY = "noor_language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored === "ar" || stored === "en" ? stored : "en") as Language;
    } catch {
      return "en";
    }
  });

  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = language;
    try { localStorage.setItem(STORAGE_KEY, language); } catch {}
  }, [language, isRTL]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string): string =>
    translations[language][key] ?? translations["en"][key] ?? key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
