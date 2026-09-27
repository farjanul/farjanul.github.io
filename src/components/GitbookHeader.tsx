"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Righteous } from "next/font/google";
import { useAppContext } from "../app/AppContext";

const righteous = Righteous({ subsets: ["latin"], weight: "400" });

interface GitbookHeaderProps {
  onToggleMobileSidebar?: () => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

export default function GitbookHeader({
  onToggleMobileSidebar,
  onSearch,
  searchQuery = "",
}: GitbookHeaderProps) {
  const { language, isAdmin, setIsAdmin } = useAppContext();
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check initial dark mode from document or storage
    if (typeof document !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light") {
        document.documentElement.classList.remove("dark");
        setIsDark(false);
      } else {
        document.documentElement.classList.add("dark");
        setIsDark(true);
      }
    }
  }, []);

  const toggleTheme = () => {
    if (typeof document === "undefined") return;
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header data-gb-site-header="true" className="flex flex-col h-[64px] sticky top-0 z-30 w-full flex-none shadow-[0px_1px_0px] shadow-tint-12/2 bg-tint-base text-sm border-b border-tint-subtle">
      <div className="gap-2 sm:gap-4 lg:gap-6 flex items-center justify-between w-full py-3 min-h-16 sm:h-16 px-4 sm:px-6 md:px-8 max-w-screen-2xl mx-auto transition-[max-width] duration-300">
        
        {/* Left: Mobile Menu & Logo */}
        <div className="flex max-w-full min-w-0 shrink items-center justify-start gap-2 lg:gap-4">
          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 -ml-2 rounded-lg text-tint-strong hover:bg-tint-hover transition-colors flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Open sidebar"
          >
            <svg viewBox="0 0 448 512" fill="currentColor" className="size-5">
              <path fill="currentColor" d="M0 88C0 74.7 10.7 64 24 64l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 112C10.7 112 0 101.3 0 88zM0 256c0-13.3 10.7-24 24-24l400 0c13.3 0 24 10.7 24 24s-10.7 24-24 24L24 280c-13.3 0-24-10.7-24-24zM448 424c0 13.3-10.7 24-24 24L24 448c-13.3 0-24-10.7-24-24s10.7-24 24-24l400 0c13.3 0 24 10.7 24 24z" />
            </svg>
          </button>

          {/* Site Title / Logo */}
          <Link href="/" className="group flex items-center gap-2.5 min-w-0 shrink-0 no-underline">
            <div className={`text-black dark:text-white text-pretty line-clamp-1 text-2xl lg:text-3xl tracking-wide select-none ${righteous.className}`}>
              Farjanul Notes
            </div>
          </Link>
        </div>

        {/* Right: Search, Language Dropdown, Add Content, Theme Switcher, Admin (if admin) */}
        <div className="flex items-center gap-2 sm:gap-3 order-last">
          {/* Search bar */}
          <div className="relative hidden sm:flex items-center">
            <div className="relative flex items-center rounded-xl border border-tint-subtle bg-tint-subtle/50 hover:bg-tint-subtle focus-within:bg-tint-subtle focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 px-2.5 sm:px-3 py-1.5 transition-all text-xs w-32 sm:w-52 md:w-64">
              <svg viewBox="0 0 512 512" fill="currentColor" className="size-3.5 text-tint-strong/5 shrink-0 mr-1.5 sm:mr-2">
                <path fill="currentColor" d="M368 208a160 160 0 1 0 -320 0 160 160 0 1 0 320 0zM337.1 371.1C301.7 399.2 256.8 416 208 416 93.1 416 0 322.9 0 208S93.1 0 208 0 416 93.1 416 208c0 48.8-16.8 93.7-44.9 129.1L505 471c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0L337.1 371.1z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearch && onSearch(e.target.value)}
                className="w-full bg-transparent outline-none text-tint-strong placeholder:text-tint-strong/5 text-xs"
              />
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-tint-strong/6 bg-tint-base border border-tint-subtle rounded">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* "+ নতুন কনটেন্ট" Button */}
          <Link
            href="/add-content"
            className="hidden sm:flex bg-emerald-600 hover:bg-emerald-500 active:scale-95 px-3 py-1.5 rounded-xl text-xs font-semibold items-center gap-1.5 shadow-sm transition-all shrink-0 no-underline"
            title={language === "bn" ? "নতুন কনটেন্ট তৈরি করুন" : "Add New Content"}
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span className="hidden sm:inline">
              {language === "bn" ? "নতুন কনটেন্ট" : "Add Content"}
            </span>
          </Link>

          {/* Admin Panel button if logged in */}
          {isAdmin && (
            <>
              <Link
                href="/add-content"
                className="p-2 rounded-xl border border-tint-subtle bg-tint-subtle/50 hover:bg-tint-hover text-tint-strong transition-colors flex items-center justify-center size-8 shrink-0 no-underline"
                title={language === "bn" ? "অ্যাডমিন প্যানেল" : "Admin Panel"}
              >
                <i className="fa-solid fa-gear text-xs"></i>
              </Link>
              <button
                type="button"
                onClick={() => setIsAdmin(false)}
                className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-400 transition-colors flex items-center justify-center size-8 shrink-0 cursor-pointer"
                title={language === "bn" ? "লগআউট" : "Logout"}
                aria-label="Logout"
              >
                <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              </button>
            </>
          )}

          {/* Theme switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-tint-subtle bg-tint-subtle/50 hover:bg-tint-hover text-tint-strong transition-colors cursor-pointer flex items-center justify-center size-8 shrink-0"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Theme toggle"
          >
            {isDark ? (
              <i className="fa-solid fa-sun text-amber-400 text-xs"></i>
            ) : (
              <i className="fa-solid fa-moon text-tint-strong text-xs"></i>
            )}
          </button>

          {/* Social Links Divider */}
          <div className="h-4 w-px bg-tint-subtle mx-0.5 hidden sm:block" />

          {/* GitHub Profile */}
          <a
            href="https://github.com/farjanul"
            target="_blank"
            rel="noopener noreferrer"
            className="flex p-2 rounded-xl border border-tint-subtle bg-tint-subtle/50 hover:bg-tint-hover text-tint-strong transition-colors items-center justify-center size-8 shrink-0 no-underline hover:text-primary"
            title="GitHub: farjanul"
            aria-label="GitHub Profile"
          >
            <i className="fa-brands fa-github text-sm"></i>
          </a>

          {/* LinkedIn Profile */}
          <a
            href="https://www.linkedin.com/in/farjanuln/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex p-2 rounded-xl border border-tint-subtle bg-tint-subtle/50 hover:bg-tint-hover text-tint-strong transition-colors items-center justify-center size-8 shrink-0 no-underline hover:text-[#0a66c2]"
            title="LinkedIn: farjanuln"
            aria-label="LinkedIn Profile"
          >
            <i className="fa-brands fa-linkedin text-sm"></i>
          </a>
        </div>

      </div>
    </header>
  );
}
