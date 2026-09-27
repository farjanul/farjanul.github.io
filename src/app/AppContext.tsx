"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type AppContextType = {
  language: "en" | "bn";
  setLanguage: (lang: "en" | "bn") => void;
  isAdmin: boolean;
  setIsAdmin: (status: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Check if user already has a saved language preference in localStorage
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang === "en" || savedLang === "bn") {
      setLanguage(savedLang);
    } else {
      // 2. Only if user has never set a preference, detect from location / timezone
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes("Dhaka") || tz.includes("Asia/Dhaka")) {
          setLanguage("bn");
        } else {
          setLanguage("en");
        }
      } catch (e) {
        setLanguage("en");
      }
    }

    // Check if admin is logged in securely from server
    import("@/app/admin/actions").then((module) => {
      module.checkSessionUser().then((res) => {
        setIsAdmin(res.isLoggedIn);
      }).catch(() => {
        setIsAdmin(false);
      });
    });
  }, []);

  const handleSetLanguage = (lang: "en" | "bn") => {
    setLanguage(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("preferredLanguage", lang);
    }
  };

  const handleSetAdmin = (status: boolean) => {
    setIsAdmin(status);
  };

  return (
    <AppContext.Provider value={{ language, setLanguage: handleSetLanguage, isAdmin, setIsAdmin: handleSetAdmin }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
