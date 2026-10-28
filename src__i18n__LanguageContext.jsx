import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

import en from "./locales/en.json";
import ta from "./locales/ta.json";
import hi from "./locales/hi.json";
import te from "./locales/te.json";
import kn from "./locales/kn.json";
import ml from "./locales/ml.json";
import bn from "./locales/bn.json";
import mr from "./locales/mr.json";
import gu from "./locales/gu.json";
import pa from "./locales/pa.json";

const translations = { en, ta, hi, te, kn, ml, bn, mr, gu, pa };

export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
];

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("safeher_language");
      if (saved && translations[saved]) return saved;
      // Default to English or navigator language if supported
      const navLang = navigator.language?.slice(0, 2);
      if (navLang && translations[navLang]) return navLang;
    } catch {
      // Fallback
    }
    return "en";
  });

  const setLanguage = (langCode) => {
    if (translations[langCode]) {
      setLanguageState(langCode);
      try {
        localStorage.setItem("safeher_language", langCode);
        document.documentElement.lang = langCode;
      } catch {
        // Fallback
      }
    }
  };

  useEffect(() => {
    try {
      document.documentElement.lang = language;
    } catch {
      // Browser fallback
    }
  }, [language]);

  const t = useMemo(() => {
    return (keyPath, params = {}) => {
      const keys = keyPath.split(".");
      let current = translations[language];

      for (const k of keys) {
        if (current && current[k] !== undefined) {
          current = current[k];
        } else {
          current = undefined;
          break;
        }
      }

      // Fallback to English if missing in chosen language
      if (current === undefined) {
        let fallback = translations.en;
        for (const k of keys) {
          if (fallback && fallback[k] !== undefined) {
            fallback = fallback[k];
          } else {
            fallback = undefined;
            break;
          }
        }
        current = fallback !== undefined ? fallback : keyPath;
      }

      if (typeof current === "string" && params) {
        return Object.entries(params).reduce((str, [pKey, pVal]) => {
          return str.replace(new RegExp(`\\{${pKey}\\}`, "g"), String(pVal));
        }, current);
      }

      return current || keyPath;
    };
  }, [language]);

  const formatDate = (dateInput, options = {}) => {
    try {
      const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return new Intl.DateTimeFormat(language, {
        month: "short",
        day: "numeric",
        year: "numeric",
        ...options,
      }).format(d);
    } catch {
      return String(dateInput);
    }
  };

  const formatTime = (dateInput, options = {}) => {
    try {
      const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
      return new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        ...options,
      }).format(d);
    } catch {
      return String(dateInput);
    }
  };

  const formatNumber = (num, options = {}) => {
    try {
      return new Intl.NumberFormat(language, options).format(num);
    } catch {
      return String(num);
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatDate,
        formatTime,
        formatNumber,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
