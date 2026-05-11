"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import translationsData from "../data/translations.json";
import type { Lang, LocalizationCtx } from "../types";

const SUPPORTED: Lang[] = ["en", "mk"];
const DEFAULT: Lang = "mk";

const Ctx = createContext<LocalizationCtx | null>(null);

export const useLocalization = (): LocalizationCtx => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLocalization must be inside LocalizationProvider");
  return ctx;
};

export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Lang>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("language") as Lang | null;
    if (saved && SUPPORTED.includes(saved)) setLanguage(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("language", language);
  }, [language, mounted]);

  const changeLanguage = (lang: Lang) => { if (SUPPORTED.includes(lang)) setLanguage(lang); };

  const t = (key: string): string => {
    const data = translationsData as Record<string, Record<string, string>>;
    return data[language]?.[key] ?? data["en"]?.[key] ?? key;
  };

  return (
    <Ctx.Provider value={{ currentLanguage: language, changeLanguage, t, translationsReady: true }}>
      {children}
    </Ctx.Provider>
  );
};

export default Ctx;
