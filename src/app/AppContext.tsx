"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { checkSessionUser } from "./admin/actions";
type AppContextType = {
  language: "en" | "bn";
  setLanguage: (lang: "en" | "bn") => void;
  isAdmin: boolean;
  setIsAdmin: (status: boolean) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<"en" | "bn">("bn");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;
    checkSessionUser()
      .then((res) => {
        if (isMounted) setIsAdmin(res.isLoggedIn);
      })
      .catch(() => {
        if (isMounted) setIsAdmin(false);
      });

    return () => {
      isMounted = false;
    };
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
