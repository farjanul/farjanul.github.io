"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAppContext } from "../app/AppContext";

export interface SidebarContent {
  id: number;
  title: string;
  slug?: string | null;
  icon?: string | null;
  body_en: string;
  body_bn: string;
  position: number;
  topic_id?: number | null;
  group_id: number;
  groupName?: string;
  topicTitle?: string | null;
}

export interface SidebarTopic {
  id: number;
  title: string;
  icon?: string | null;
  position: number;
  group_id: number;
  contents: SidebarContent[];
}

export interface SidebarGroup {
  id: number;
  name: string;
  position: number;
  topics: SidebarTopic[];
  contents: SidebarContent[];
}

interface GitbookSidebarProps {
  groups: SidebarGroup[];
  selectedContentId: number | null;
  onSelectContent: (content: SidebarContent) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function GitbookSidebar({
  groups,
  selectedContentId,
  onSelectContent,
  isMobileOpen = false,
  onCloseMobile,
}: GitbookSidebarProps) {
  const { language } = useAppContext();
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});

  // Auto-expand topic if selected content belongs to it
  useEffect(() => {
    if (!selectedContentId || !groups) return;

    groups.forEach((group) => {
      (group.topics || []).forEach((topic) => {
        const hasActive = (topic.contents || []).some((c) => c.id === selectedContentId);
        if (hasActive) {
          setExpandedTopics((prev) => ({ ...prev, [topic.id]: true }));
        }
      });
    });
  }, [selectedContentId, groups]);

  const toggleTopic = (topicId: number) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: prev[topicId] !== undefined ? !prev[topicId] : false,
    }));
  };

  // Sort groups by position
  const sortedGroups = [...(groups || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  const sidebarBody = (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-2"
      style={{ height: "100%", maxHeight: "100%" }}
    >
      {sortedGroups.length === 0 ? (
        <div className="p-6 text-center text-xs text-tint-strong/6 flex flex-col items-center justify-center my-auto">
          <i className="fa-solid fa-spinner fa-spin text-3xl mb-3 text-primary"></i>
          <p className="font-medium">
            Loading...
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-y-0.5 grow border-tint-subtle sidebar-list-line:border-l">
          {sortedGroups.map((group, gIdx) => {
            // Merge topics and direct contents under group, sorted position-wise
            const groupItems = [
              ...(group.topics || []).map((t) => ({ ...t, itemType: "topic" as const })),
              ...(group.contents || []).map((c) => ({ ...c, itemType: "content" as const })),
            ].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

            return (
              <li key={group.id} className={`page-group-item flex flex-col ${gIdx > 0 ? "mt-4" : "mt-1"}`}>
                {/* Group Title Header */}
                <div className="sticky top-0 z-1 bg-inherit pt-2 pb-1">
                  <div className="relative flex flex-row items-center gap-3 p-1.5 pl-3 min-h-8 text-left font-heading font-semibold text-xs uppercase tracking-wider text-tint-strong/8">
                    <span className="min-w-0 flex-1 truncate">{group.name}</span>
                  </div>
                </div>

                {/* Items List (Topics & Direct Contents) */}
                <ul className="flex flex-col gap-y-0.5 mt-0.5">
                  {groupItems.map((item) => {
                    if (item.itemType === "topic") {
                      const topic = item as SidebarTopic;
                      const topicContents = [...(topic.contents || [])].sort(
                        (a, b) => (a.position ?? 0) - (b.position ?? 0)
                      );
                      const hasContents = topicContents.length > 0;
                      const isExpanded = expandedTopics[topic.id] ?? true;

                      return (
                        <li key={`topic-${topic.id}`} className="page-topic-item flex flex-col mt-0.5">
                          {/* Topic Header Row */}
                          <div
                            onClick={() => toggleTopic(topic.id)}
                            className="topic-header group/toclink toclink relative transition-colors flex flex-row justify-start items-center gap-2.5 circular-corners:rounded-2xl rounded-md p-1.5 pl-3 text-balance font-normal text-sm text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong cursor-pointer select-none"
                          >
                            {/* Topic Icon */}
                            {topic.icon ? (
                              <i className={`${topic.icon} size-[1em] text-tint-strong/6 shrink-0 text-sm`}></i>
                            ) : (
                              <svg viewBox="0 0 448 512" fill="currentColor" className="gb-icon size-[1em] text-tint-strong/6 shrink-0">
                                <path fill="currentColor" d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM80 426.5L80 85.5 391.3 256 80 426.5z" />
                              </svg>
                            )}
                            <span className="flex-1 truncate">{topic.title}</span>

                            {/* Chevron Toggle Button */}
                            {hasContents && (
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTopic(topic.id);
                                }}
                                className="accordion-toggle-btn ml-auto p-1 rounded hover:bg-tint-base text-tint-strong/6 hover:text-tint-strong flex items-center justify-center min-w-6 min-h-6 transition-transform cursor-pointer"
                              >
                                <svg
                                  viewBox="0 0 320 512"
                                  fill="currentColor"
                                  className={`chevron-icon gb-icon size-2.5 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                                >
                                  <path fill="currentColor" d="M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Nested Sub-contents Accordion */}
                          {hasContents && isExpanded && (
                            <div className="topic-accordion-body flex flex-col overflow-hidden transition-all duration-200">
                              <ul className="flex flex-col gap-y-0.5 ml-4 pl-2 my-1 border-l border-tint-subtle">
                                {topicContents.map((c) => {
                                  const isSelected = c.id === selectedContentId;
                                  return (
                                    <li key={`content-${c.id}`} className="page-document-item flex flex-col">
                                      <a
                                        href={`/${c.slug || c.id}`}
                                        onClick={(e) => {
                                          if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                                            e.preventDefault();
                                            onSelectContent({
                                              ...c,
                                              topicTitle: topic.title,
                                              groupName: group.name,
                                            });
                                            if (onCloseMobile) onCloseMobile();
                                          }
                                        }}
                                        className={`content-nav-link group/toclink toclink relative transition-colors flex flex-row justify-start items-center gap-2.5 circular-corners:rounded-2xl rounded-md p-1.5 pl-3 text-balance text-sm text-left w-full cursor-pointer no-underline ${
                                          isSelected
                                            ? "font-semibold text-primary-subtle bg-primary/10"
                                            : "font-normal text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong"
                                        }`}
                                      >
                                        {c.icon && (
                                          <i
                                            className={`${c.icon} size-[1em] ${isSelected ? "text-primary" : "text-tint-strong/6"} shrink-0 text-xs`}
                                          ></i>
                                        )}
                                        <span className="truncate">{c.title}</span>
                                      </a>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          )}
                        </li>
                      );
                    } else {
                      // Direct Content under Group
                      const content = item as SidebarContent;
                      const isSelected = content.id === selectedContentId;
                      return (
                        <li key={`content-${content.id}`} className="page-document-item flex flex-col mt-0.5">
                          <a
                            href={`/${content.slug || content.id}`}
                            onClick={(e) => {
                              if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                                e.preventDefault();
                                onSelectContent({
                                  ...content,
                                  topicTitle: null,
                                  groupName: group.name,
                                });
                                if (onCloseMobile) onCloseMobile();
                              }
                            }}
                            className={`content-nav-link group/toclink toclink relative transition-colors flex flex-row justify-start items-center gap-2.5 circular-corners:rounded-2xl rounded-md p-1.5 pl-3 text-balance text-sm text-left w-full cursor-pointer no-underline ${
                              isSelected
                                ? "font-semibold text-primary-subtle bg-primary/10"
                                : "font-normal text-tint-strong/7 hover:bg-tint-hover hover:text-tint-strong"
                            }`}
                          >
                            {content.icon && (
                              <i
                                className={`${content.icon} size-[1em] ${isSelected ? "text-primary" : "text-tint-strong/6"} shrink-0 text-xs`}
                              ></i>
                            )}
                            <span className="truncate">{content.title}</span>
                          </a>
                        </li>
                      );
                    }
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="side-sheet hidden lg:flex pr-4 flex-col min-h-0 gap-4 group/table-of-contents text-sm grow-0 shrink-0 w-80 min-w-80 xl:w-[340px] xl:min-w-[340px] pt-6 pb-4 mr-12 z-0 self-start"
        style={{
          position: "sticky",
          top: "4rem",
          height: "calc(100vh - 4rem)",
          maxHeight: "calc(100vh - 4rem)",
        }}
      >
        <div
          className="relative flex flex-col min-h-0 grow bg-tint-subtle rounded-2xl overflow-hidden shadow-xs"
          style={{ height: "100%", maxHeight: "100%" }}
        >
          <div
            className="group/scroll-container relative flex shrink grow min-h-0 overflow-hidden"
            style={{ height: "100%", maxHeight: "100%" }}
          >
            {sidebarBody}
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          ></div>

          {/* Drawer content */}
          <div className="side-sheet fixed inset-y-0 z-50 left-0 max-w-[calc(100%-4.5rem)] w-4/5 md:w-1/2 bg-tint-base border-r border-tint-subtle h-full p-4 flex flex-col min-h-0 gap-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-tint-subtle mb-1">
              <span className="font-heading font-semibold text-tint-strong">Navigation</span>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 rounded text-tint-strong/6 hover:text-tint-strong text-xl leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
}
