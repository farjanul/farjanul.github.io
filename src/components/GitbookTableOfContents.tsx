"use client";

import React, { useEffect, useState } from "react";

interface TocHeading {
  id: string;
  text: string;
}

interface GitbookTableOfContentsProps {
  contentHtml: string;
}

export default function GitbookTableOfContents({ contentHtml }: GitbookTableOfContentsProps) {
  const [headings, setHeadings] = useState<TocHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "system" | "dark">("light");

  useEffect(() => {
    // Initialize theme state from storage / document
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") {
        setTheme("dark");
      } else {
        setTheme("light");
      }
    }
  }, []);

  const changeTheme = (newTheme: "light" | "system" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    if (typeof document === "undefined") return;

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else if (newTheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  useEffect(() => {
    if (typeof document === "undefined") return;

    const findHeadings = () => {
      // 1. Query live rendered article in DOM
      const article = document.querySelector("article");
      let elements = article ? Array.from(article.querySelectorAll("h2")) : [];

      // 2. Fallback: parse from contentHtml string
      if (elements.length === 0 && contentHtml) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHtml, "text/html");
        elements = Array.from(doc.querySelectorAll("h2"));
      }

      if (elements.length === 0) {
        setHeadings([]);
        setActiveId("");
        return;
      }

      const items: TocHeading[] = [];
      elements.forEach((el, index) => {
        let id = el.getAttribute("id");
        if (!id) {
          id = `heading-${index}`;
          el.setAttribute("id", id);
        }
        el.classList.add("scroll-mt-24");

        const text = el.textContent?.replace(/#/g, "").trim() || "";
        if (text) {
          items.push({ id, text });
        }
      });

      setHeadings(items);
      if (items.length > 0) {
        setActiveId((prev) => (prev && items.some((i) => i.id === prev) ? prev : items[0].id));
      }
    };

    findHeadings();
    const timer = setTimeout(findHeadings, 80);
    return () => clearTimeout(timer);
  }, [contentHtml]);

  // Scroll listener to update active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const headerOffset = 110;

      for (let i = headings.length - 1; i >= 0; i--) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const top = el.getBoundingClientRect().top + scrollY - headerOffset;
          if (scrollY >= top - 20) {
            setActiveId(headings[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  const handleScrollTo = (id: string) => {
    setActiveId(id);
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside
      className="side-sheet hidden lg:flex flex-col text-sm shrink-0 w-64 p-4 pt-8 ml-4 text-tint-strong/8 order-last self-start break-anywhere"
      style={{
        position: "sticky",
        top: "4rem",
        height: "calc(100vh - 4rem)",
        maxHeight: "calc(100vh - 4rem)",
      }}
    >
      <div className="flex h-full w-full shrink-0 flex-col overflow-hidden">
        
        {/* On this page header */}
        <div className="mb-3 ml-3 flex items-center justify-between">
          <button
            type="button"
            className="leading-wider flex cursor-pointer items-center gap-1.5 text-xs font-semibold uppercase text-tint-strong/7 hover:text-tint-strong transition-colors"
          >
            <svg viewBox="0 0 448 512" fill="currentColor" className="gb-icon size-3 shrink-0">
              <path fill="currentColor" d="M24 64C10.7 64 0 74.7 0 88s10.7 24 24 24l400 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L24 64zM152 232c-13.3 0-24 10.7-24 24s10.7 24 24 24l272 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-272 0zM128 424c0 13.3 10.7 24 24 24l272 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-272 0c-13.3 0-24 10.7-24 24zM0 424c0 13.3 10.7 24 24 24s24-10.7 24-24l0-176c0-13.3-10.7-24-24-24S0 234.7 0 248L0 424z" />
            </svg>
            <span>On this page</span>
          </button>
        </div>

        {/* Outline List (না থাকলে খালি বা empty থাকবে) */}
        <div className="flex shrink flex-col overflow-hidden grow">
          <div data-gb-page-outline="true" className="overflow-y-auto max-h-[calc(100vh-14rem)] hide-scrollbar">
            <ul className="relative flex flex-col pl-2 pb-5">
              {headings.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id} className="flex flex-row relative h-fit mt-1.5 first:mt-0 mb-0.5">
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleScrollTo(item.id);
                      }}
                      className={`relative z-10 text-md w-full py-1.5 px-2.5 transition-all duration-200 rounded-md cursor-pointer ${
                        isActive
                          ? "text-primary font-semibold bg-primary/15"
                          : "text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong"
                      }`}
                    >
                      <span className="block">{item.text}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      </div>
    </aside>
  );
}
