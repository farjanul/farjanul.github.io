"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useAppContext } from "../app/AppContext";
import GitbookHeader from "./GitbookHeader";
import GitbookSidebar, {
  SidebarGroup,
  SidebarContent,
} from "./GitbookSidebar";
import GitbookTableOfContents from "./GitbookTableOfContents";
import hljs from "highlight.js";

function flattenGroups(data: SidebarGroup[]): SidebarContent[] {
  const flatList: SidebarContent[] = [];
  const sortedGroups = [...(data || [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );

  sortedGroups.forEach((group) => {
    const groupItems = [
      ...(group.topics || []).map((t) => ({ ...t, itemType: "topic" as const })),
      ...(group.contents || []).map((c) => ({ ...c, itemType: "content" as const })),
    ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    groupItems.forEach((item) => {
      if (item.itemType === "topic") {
        const topicContents = [...(item.contents || [])].sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0)
        );
        topicContents.forEach((c) => {
          flatList.push({
            ...c,
            topicTitle: item.title,
            groupName: group.name,
          });
        });
      } else {
        flatList.push({
          ...item,
          topicTitle: null,
          groupName: group.name,
        });
      }
    });
  });

  return flatList;
}

function findInitialContent(flatList: SidebarContent[], initialSlug?: string): SidebarContent | null {
  if (!flatList.length) return null;

  if (initialSlug && initialSlug !== "admin" && initialSlug !== "add-content") {
    const decoded = decodeURIComponent(initialSlug);
    const matched = flatList.find((c) => c.slug === decoded || String(c.id) === decoded);
    if (matched) return matched;
  }

  if (typeof window !== "undefined") {
    const targetSlug = window.location.pathname.replace(/^\/+/g, "").split("/")[0];
    if (targetSlug && targetSlug !== "admin" && targetSlug !== "add-content") {
      const decoded = decodeURIComponent(targetSlug);
      const matched = flatList.find((c) => c.slug === decoded || String(c.id) === decoded);
      if (matched) return matched;
    }
  }

  const defaultOverview = flatList.find((c) =>
    c.title.toLowerCase().includes("overview")
  );
  return defaultOverview || flatList[0];
}

interface HomePageClientProps {
  initialGroups: SidebarGroup[];
  initialSlug?: string;
}

export default function HomePageClient({ initialGroups = [], initialSlug }: HomePageClientProps) {
  const { language, setLanguage } = useAppContext();
  const [groups] = useState<SidebarGroup[]>(initialGroups);
  
  const allContents = useMemo(() => flattenGroups(groups), [groups]);

  const [selectedContent, setSelectedContent] = useState<SidebarContent | null>(() =>
    findInitialContent(flattenGroups(initialGroups), initialSlug)
  );

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Update selected content when initialSlug prop changes
  useEffect(() => {
    if (initialSlug && allContents.length > 0) {
      const decoded = decodeURIComponent(initialSlug);
      const match = allContents.find((c) => c.slug === decoded || String(c.id) === decoded);
      if (match) {
        setSelectedContent((prev) => (prev?.id === match.id ? prev : match));
      }
    }
  }, [initialSlug, allContents]);

  // Handle browser back/forward popstate
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined" || allContents.length === 0) return;
      const pathSlug = window.location.pathname.replace(/^\/+/g, "").split("/")[0];
      if (pathSlug && pathSlug !== "admin" && pathSlug !== "add-content") {
        const decoded = decodeURIComponent(pathSlug);
        const match = allContents.find((c) => c.slug === decoded || String(c.id) === decoded);
        if (match) {
          setSelectedContent(match);
        }
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [allContents]);

  // Update document title when selectedContent changes
  useEffect(() => {
    if (selectedContent) {
      document.title = `${selectedContent.title} | Farjanul Notebook`;
    } else {
      document.title = "Farjanul Notebook";
    }
  }, [selectedContent]);

  // Compute active body based on selected language
  const activeBody = useMemo(() => {
    if (!selectedContent) return "";
    return language === "bn"
      ? selectedContent.body_bn || selectedContent.body_en
      : selectedContent.body_en || selectedContent.body_bn;
  }, [selectedContent, language]);

  // Inject heading IDs for smooth table of contents scrolling
  const processedBody = useMemo(() => {
    if (!activeBody) return "";
    let headingIdx = 0;
    // Support markdown ## if present
    const formatted = activeBody.replace(/^##\s+(.*$)/gim, "<h2>$1</h2>");
    return formatted.replace(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs, content) => {
      let cleanAttrs = attrs.replace(/\s*id=["'][^"']*["']/gi, "");
      if (/class=["']/i.test(cleanAttrs)) {
        cleanAttrs = cleanAttrs.replace(/class=["']([^"']*)["']/i, 'class="$1 scroll-mt-24"');
      } else {
        cleanAttrs += ' class="scroll-mt-24"';
      }
      const id = `heading-${headingIdx++}`;
      return `<h2 id="${id}" ${cleanAttrs}>${content}</h2>`;
    });
  }, [activeBody]);

  // Compute Previous and Next items
  const currentIndex = selectedContent
    ? allContents.findIndex((c) => c.id === selectedContent.id)
    : -1;
  const prevItem = currentIndex > 0 ? allContents[currentIndex - 1] : null;
  const nextItem =
    currentIndex >= 0 && currentIndex < allContents.length - 1
      ? allContents[currentIndex + 1]
      : null;

  const handleSelectContent = (content: SidebarContent) => {
    setSelectedContent(content);
    if (typeof window !== "undefined" && content.slug) {
      window.history.pushState(null, "", `/${content.slug}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCopyContent = async () => {
    if (!selectedContent) return;

    try {
      let textToCopy = "";
      if (activeBody) {
        const formattedHtml = activeBody
          .replace(/<br\s*\/?>/gi, "\n")
          .replace(/<\/p>/gi, "\n\n")
          .replace(/<\/h[1-6]>/gi, "\n\n")
          .replace(/<\/li>/gi, "\n")
          .replace(/<\/tr>/gi, "\n");
        const temp = document.createElement("div");
        temp.innerHTML = formattedHtml;
        textToCopy = (temp.textContent || temp.innerText || "").trim();
      }

      if (!textToCopy && selectedContent.title) {
        textToCopy = selectedContent.title;
      }

      // Try rich copy (HTML & plain text) if supported
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write && activeBody) {
        try {
          const textBlob = new Blob([textToCopy], { type: "text/plain" });
          const htmlBlob = new Blob([activeBody], { type: "text/html" });
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": textBlob,
              "text/html": htmlBlob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          return;
        } catch (clipboardErr) {
          console.warn("ClipboardItem write failed, falling back to writeText", clipboardErr);
        }
      }

      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy content:", err);
    }
  };

  const articleRef = useRef<HTMLElement>(null);

  // Enhance code blocks and tables in the article for frontend
  useEffect(() => {
    if (!articleRef.current) return;

    // 1. Enhance Code Blocks
    const preElements = articleRef.current.querySelectorAll("pre");
    preElements.forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block-wrapper")) return;

      const codeEl = pre.querySelector("code") || pre;
      const rawCode = (codeEl.textContent || pre.textContent || "").trim();

      // Detect language from class
      let lang = "";
      const classes = `${codeEl.className || ""} ${pre.className || ""}`;
      const match = classes.match(/language-([a-z0-9_-]+)/i);
      if (match) lang = match[1].toLowerCase();

      // Syntax highlight
      let highlightedCode = rawCode;
      let detectedLang = lang || "code";
      try {
        if (lang && hljs.getLanguage(lang)) {
          highlightedCode = hljs.highlight(rawCode, { language: lang, ignoreIllegals: true }).value;
        } else {
          const res = hljs.highlightAuto(rawCode);
          detectedLang = res.language || "text";
          highlightedCode = res.value || rawCode;
        }
      } catch { /* keep rawCode */ }

      codeEl.innerHTML = highlightedCode;
      codeEl.classList.add("hljs");

      const displayLang = (lang || detectedLang || "code").toUpperCase();

      // Build wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "code-block-wrapper";

      // Build header with pure CSS classes
      const header = document.createElement("div");
      header.className = "code-block-header";

      // Left side: dots + language badge
      const left = document.createElement("div");
      left.style.cssText = "display:flex;align-items:center;";

      const dots = document.createElement("div");
      dots.className = "code-block-dots";
      dots.innerHTML = `<span class="dot-red"></span><span class="dot-yellow"></span><span class="dot-green"></span>`;

      const badge = document.createElement("div");
      badge.className = "code-lang-badge";
      badge.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>${displayLang}`;

      left.appendChild(dots);
      left.appendChild(badge);

      // Copy button
      const copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "copy-code-btn";
      copyBtn.title = "Copy code";
      copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>Copy`;

      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(rawCode);
        copyBtn.classList.add("copied");
        copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#98c379" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>Copied!`;
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          copyBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path></svg>Copy`;
        }, 2000);
      });

      header.appendChild(left);
      header.appendChild(copyBtn);

      pre.parentNode?.insertBefore(wrapper, pre);
      wrapper.appendChild(header);
      wrapper.appendChild(pre);
    });

    // 2. Enhance Tables
    const tables = articleRef.current.querySelectorAll("table");
    tables.forEach((table) => {
      if (table.parentElement?.classList.contains("article-table-wrapper")) return;

      const wrapper = document.createElement("div");
      wrapper.className = "article-table-wrapper";

      const header = document.createElement("div");
      header.className = "article-table-header";

      const badge = document.createElement("div");
      badge.className = "table-badge";
      badge.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>Table View`;

      const hint = document.createElement("div");
      hint.className = "table-scroll-hint";
      hint.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"></polyline></svg>Scroll<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

      header.appendChild(badge);
      header.appendChild(hint);

      const scrollDiv = document.createElement("div");
      scrollDiv.className = "article-table-scroll";

      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(header);
      wrapper.appendChild(scrollDiv);
      scrollDiv.appendChild(table);
    });
  }, [processedBody]);

  return (
    <div className="min-h-screen flex flex-col bg-tint-base text-tint-strong font-Inter antialiased">
      {/* 1. GitBook Top Header */}
      <GitbookHeader
        onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
      />

      {/* 2. Main Page Layout (Sidebar + Reading Area + Table of Contents) */}
      <div className="flex flex-col lg:flex-row flex-1 max-w-screen-2xl mx-auto w-full px-4 sm:px-6 md:px-8">
        
        {/* Left Navigation Sidebar */}
        <GitbookSidebar
          groups={groups}
          selectedContentId={selectedContent?.id ?? null}
          onSelectContent={handleSelectContent}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Center: Main Content Reading Area */}
        <main className="relative min-w-0 flex-1 break-anywhere py-8 @container flex flex-col max-w-3xl layout-wide:max-w-4xl mx-auto w-full">
          {!selectedContent ? (
            /* Empty state when no content is in database */
            <div className="text-center py-20 px-4 border border-dashed border-tint-subtle rounded-2xl bg-tint-subtle/30 my-auto">
              <div className="size-16 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                <i className="fa-solid fa-folder-plus"></i>
              </div>
              <h2 className="text-xl font-bold mb-2 text-tint-strong">
                No Content in Database
              </h2>
              <p className="text-sm text-tint-strong/6 max-w-md mx-auto mb-6">
                Create groups, topics, and contents from the admin panel to view them here.
              </p>
              <Link
                href="/add-content?screen=add-content"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 font-semibold text-sm hover:bg-emerald-500 shadow-md transition-all"
              >
                <i className="fa-solid fa-plus"></i>
                Add New Content
              </Link>
            </div>
          ) : (
            <>
              {/* Breadcrumb Navigation */}
              <nav aria-label="Breadcrumb" className="mb-4 text-xs text-tint-strong/6">
                <ol className="flex items-center gap-1.5 flex-wrap">
                  <li className="inline">
                    <span className="hover:underline font-normal text-tint-strong/7 cursor-default">
                      {selectedContent.groupName || "System Design"}
                    </span>
                  </li>
                  <li className="inline text-tint-subtle">
                    <svg viewBox="0 0 320 512" fill="currentColor" className="size-2 inline">
                      <path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                    </svg>
                  </li>

                  {selectedContent.topicTitle && (
                    <>
                      <li className="inline">
                        <span className="hover:underline font-normal text-tint-strong/7 cursor-default">
                          {selectedContent.topicTitle}
                        </span>
                      </li>
                      <li className="inline text-tint-subtle">
                        <svg viewBox="0 0 320 512" fill="currentColor" className="size-2 inline">
                          <path fill="currentColor" d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                        </svg>
                      </li>
                    </>
                  )}

                  <li className="inline text-tint-strong font-medium">
                    {selectedContent.icon && (
                      <i className={`${selectedContent.icon} text-primary text-xs mr-1 inline`}></i>
                    )}
                    <span>{selectedContent.title}</span>
                  </li>
                </ol>
              </nav>

              {/* Title & Copy Button Header */}
              <header className="mb-8 flex items-start justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-tint-strong flex items-center gap-3">
                  {selectedContent.icon && (
                    <i className={`${selectedContent.icon} text-primary text-2xl sm:text-3xl shrink-0`}></i>
                  )}
                  <span>{selectedContent.title}</span>
                </h1>

                {/* Actions: Language Toggle & Copy Content */}
                <div className="flex items-center gap-2 shrink-0 mt-1">
                  {/* Language Toggle Button */}
                  <button
                    type="button"
                    onClick={() => setLanguage(language === "en" ? "bn" : "en")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-tint-subtle bg-tint-subtle/50 hover:bg-tint-hover text-tint-strong/7 hover:text-tint-strong text-xs font-medium transition-colors cursor-pointer shrink-0"
                    title={language === "en" ? "Change to Bengali" : "Change to English"}
                  >
                    <i className="fa-solid fa-language text-sm"></i>
                    <span>{language === "en" ? "Change to Bengali" : "Change to English"}</span>
                  </button>

                  {/* Copy Content Button */}
                  <button
                    type="button"
                    onClick={handleCopyContent}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-tint-subtle bg-tint-subtle/50 hover:bg-tint-hover text-tint-strong/7 hover:text-tint-strong text-xs font-medium transition-colors cursor-pointer shrink-0"
                    title="Copy content"
                  >
                    <i className={`fa-regular ${copied ? "fa-circle-check text-emerald-500" : "fa-copy"}`}></i>
                    <span>{copied ? "Copied!" : "Copy"}</span>
                  </button>
                </div>
              </header>

              {/* Main Content Body */}
              <article ref={articleRef} className="prose max-w-none text-tint-strong leading-relaxed text-base break-words">
                {processedBody ? (
                  <div
                    className="flex flex-col [&>*+*]:mt-4"
                    dangerouslySetInnerHTML={{ __html: processedBody }}
                  />
                ) : (
                  <p className="text-tint-strong/6 italic">
                    No content description provided.
                  </p>
                )}
              </article>

              {/* Previous / Next Navigation Cards */}
              <div className="max-w-3xl layout-wide:max-w-6xl mx-auto w-full mt-12 pt-6 flex items-center justify-between gap-4">
                {prevItem ? (
                  <button
                    type="button"
                    onClick={() => handleSelectContent(prevItem)}
                    className="group flex flex-1 items-center gap-3 rounded-xl border border-tint-subtle bg-tint-subtle/40 hover:bg-tint-subtle p-4 text-sm text-tint outline-none transition-all hover:border-primary/50 text-left cursor-pointer"
                  >
                    <svg viewBox="0 0 320 512" fill="currentColor" className="size-3 shrink-0 text-tint-strong/6 group-hover:text-primary transition-colors">
                      <path fill="currentColor" d="M7.5 239c-9.4 9.4-9.4 24.6 0 33.9l200 200c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-183-183 183-183c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0L7.5 239z" />
                    </svg>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-tint-strong/6">
                        Previous
                      </span>
                      <span className="line-clamp-1 font-semibold text-tint-strong group-hover:text-primary flex items-center gap-1.5 mt-0.5 transition-colors">
                        {prevItem.icon && <i className={`${prevItem.icon} text-xs text-primary`}></i>}
                        {prevItem.title}
                      </span>
                    </div>
                  </button>
                ) : (
                  <div className="flex-1"></div>
                )}

                {nextItem ? (
                  <button
                    type="button"
                    onClick={() => handleSelectContent(nextItem)}
                    className="group flex flex-1 items-center justify-end gap-3 rounded-xl border border-tint-subtle bg-tint-subtle/40 hover:bg-tint-subtle p-4 text-sm text-tint outline-none transition-all hover:border-primary/50 text-right cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0 items-end">
                      <span className="text-xs text-tint-strong/6">
                        Next
                      </span>
                      <span className="line-clamp-1 font-semibold text-tint-strong group-hover:text-primary flex items-center gap-1.5 mt-0.5 transition-colors">
                        {nextItem.title}
                        {nextItem.icon && <i className={`${nextItem.icon} text-xs text-primary`}></i>}
                      </span>
                    </div>
                    <svg viewBox="0 0 320 512" fill="currentColor" className="size-3 shrink-0 text-tint-strong/6 group-hover:text-primary transition-colors">
                      <path fill="currentColor" d="M312.5 273c9.4-9.4 9.4-24.6 0-33.9l-200-200c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l183 183-183 183c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l200-200z" />
                    </svg>
                  </button>
                ) : (
                  <div className="flex-1"></div>
                )}
              </div>
            </>
          )}
        </main>

        {/* Right Sidebar: Table of Contents ("ON THIS PAGE") */}
        <GitbookTableOfContents contentHtml={processedBody} />

      </div>
    </div>
  );
}
