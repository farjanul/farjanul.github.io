"use client";

import { useEffect, useState } from "react";
import { getContentGroups } from "../lib/data";
import { useAppContext } from "../app/AppContext";

type ContentItem = {
  id: number;
  title: string;
  slug?: string | null;
  body_en: string;
  body_bn: string;
  topic_id: number | null;
  position: number;
};

type TopicItem = {
  id: number;
  title: string;
  icon: string | null;
  position: number;
  contents: ContentItem[];
};

type GroupItem = {
  id: number;
  name: string;
  position: number;
  topics: TopicItem[];
  contents: ContentItem[]; // Direct group contents (topic_id is null)
};

export default function Sidebar({
  onSelectContent,
  selectedContentId,
}: {
  onSelectContent: (content: ContentItem) => void;
  selectedContentId: number | null;
}) {
  const { language } = useAppContext();
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [expandedTopics, setExpandedTopics] = useState<Record<number, boolean>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getContentGroups().then((data) => {
      setGroups(data as GroupItem[]);
      // Auto-expand all groups
      const gExpanded: Record<number, boolean> = {};
      (data as GroupItem[]).forEach((g) => (gExpanded[g.id] = true));
      setExpandedGroups(gExpanded);
      setLoading(false);
    });
  }, []);

  const toggleTopic = (id: number) => {
    setExpandedTopics((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleGroup = (id: number) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Merge topics and direct contents into a single sorted list per group
  const getMergedItems = (group: GroupItem) => {
    const items: Array<
      | { type: "topic"; data: TopicItem }
      | { type: "content"; data: ContentItem }
    > = [];

    group.topics.forEach((t) => items.push({ type: "topic", data: t }));
    group.contents.forEach((c) => items.push({ type: "content", data: c }));

    items.sort((a, b) => a.data.position - b.data.position);
    return items;
  };

  if (loading) {
    return (
      <aside style={sidebarStyle}>
        <div style={logoSection}>
          <div style={logoIcon}>📚</div>
          <span style={logoText}>Notes CMS</span>
        </div>
        <div style={{ padding: "24px 16px", color: "#9ca3af", fontSize: "13px" }}>
          <div className="py-20 text-center text-tint-strong/6">
            <i className="fa-solid fa-spinner fa-spin text-3xl mb-3 text-primary"></i>
            <p className="text-sm font-medium">Loading...</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside style={sidebarStyle}>
      {/* Logo */}
      <div style={logoSection}>
        <div style={logoIcon}>📚</div>
        <span style={logoText}>Notes CMS</span>
      </div>

      {/* Navigation */}
      <nav style={navStyle}>
        {groups.length === 0 && (
          <p style={{ color: "#9ca3af", fontSize: "13px", padding: "0 16px" }}>
            No content available.
          </p>
        )}

        {groups.map((group) => {
          const isGroupExpanded = expandedGroups[group.id] ?? true;
          const mergedItems = getMergedItems(group);

          return (
            <div key={group.id} style={{ marginBottom: "8px" }}>
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.id)}
                style={groupHeaderStyle}
              >
                <span style={groupHeaderText}>{group.name}</span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 320 512"
                  fill="currentColor"
                  style={{
                    transform: isGroupExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                    opacity: 0.5,
                    flexShrink: 0,
                  }}
                >
                  <path d="M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z" />
                </svg>
              </button>

              {/* Group Children */}
              <div
                style={{
                  display: isGroupExpanded ? "block" : "none",
                  marginTop: "2px",
                }}
              >
                {mergedItems.map((item) => {
                  if (item.type === "topic") {
                    const topic = item.data as TopicItem;
                    const hasChildren = topic.contents.length > 0;
                    const isExpanded = expandedTopics[topic.id] ?? false;

                    if (hasChildren) {
                      // Topic with children — expandable
                      return (
                        <div key={`topic-${topic.id}`}>
                          <button
                            onClick={() => toggleTopic(topic.id)}
                            style={topicButtonStyle}
                          >
                            <span style={topicIconStyle}>
                              {topic.icon ? (
                                <i className={`fa-solid ${topic.icon}`} style={{ fontSize: "12px" }} />
                              ) : (
                                <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor" style={{ opacity: 0.45 }}>
                                  <path d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM80 426.5L80 85.5 391.3 256 80 426.5z" />
                                </svg>
                              )}
                            </span>
                            <span style={{ flex: 1, textAlign: "left" }}>{topic.title}</span>
                            <svg
                              width="8"
                              height="8"
                              viewBox="0 0 320 512"
                              fill="currentColor"
                              style={{
                                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                                transition: "transform 0.2s ease",
                                opacity: 0.4,
                                flexShrink: 0,
                                marginLeft: "auto",
                              }}
                            >
                              <path d="M313.5 239c9.4 9.4 9.4 24.6 0 33.9l-200 200c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l183-183-183-183c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l200 200z" />
                            </svg>
                          </button>

                          {/* Topic's children */}
                          <div
                            style={{
                              display: isExpanded ? "block" : "none",
                              paddingLeft: "16px",
                            }}
                          >
                            {topic.contents.map((content) => (
                              <button
                                key={`content-${content.id}`}
                                onClick={() => onSelectContent(content)}
                                style={{
                                  ...contentItemStyle,
                                  ...(selectedContentId === content.id ? activeContentStyle : {}),
                                }}
                              >
                                <span style={contentDotStyle}>
                                  <span style={{
                                    width: "4px",
                                    height: "4px",
                                    borderRadius: "50%",
                                    background: selectedContentId === content.id ? "#346DDB" : "#c4c4c4",
                                  }} />
                                </span>
                                <span>{content.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      // Topic without children — acts like a content item
                      return (
                        <div
                          key={`topic-${topic.id}`}
                          style={leafTopicStyle}
                        >
                          <span style={topicIconStyle}>
                            {topic.icon ? (
                              <i className={`fa-solid ${topic.icon}`} style={{ fontSize: "12px" }} />
                            ) : (
                              <svg width="14" height="14" viewBox="0 0 448 512" fill="currentColor" style={{ opacity: 0.45 }}>
                                <path d="M51.6 37.6C39.5 44.8 32 57.9 32 72l0 368c0 14.1 7.5 27.2 19.6 34.4s27.2 7.5 39.6 .7l336-184c12.8-7 20.8-20.5 20.8-35.1s-8-28.1-20.8-35.1l-336-184c-12.4-6.8-27.4-6.5-39.6 .7zM80 426.5L80 85.5 391.3 256 80 426.5z" />
                              </svg>
                            )}
                          </span>
                          <span>{topic.title}</span>
                        </div>
                      );
                    }
                  } else {
                    // Direct content under group
                    const content = item.data as ContentItem;
                    return (
                      <button
                        key={`content-${content.id}`}
                        onClick={() => onSelectContent(content)}
                        style={{
                          ...contentItemStyle,
                          ...(selectedContentId === content.id ? activeContentStyle : {}),
                        }}
                      >
                        <span style={contentIconStyle}>
                          <svg width="14" height="14" viewBox="0 0 512 512" fill="currentColor" style={{ opacity: 0.45 }}>
                            <path d="M168 80c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24L168 80zM168 176c-13.3 0-24 10.7-24 24s10.7 24 24 24l176 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-176 0zM0 464L0 48C0 21.5 21.5 0 48 0L384 0l128 128 0 336c0 26.5-21.5 48-48 48L48 512c-26.5 0-48-21.5-48-48zM384 48L48 48l0 416 416 0 0-320-80 0c-17.7 0-32-14.3-32-32l0-64z" />
                          </svg>
                        </span>
                        <span>{content.title}</span>
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

// ===================== Styles =====================

const sidebarStyle: React.CSSProperties = {
  width: "280px",
  minWidth: "280px",
  height: "100vh",
  background: "#fafafa",
  borderRight: "1px solid #e8e8e8",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  position: "sticky",
  top: 0,
};

const logoSection: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "20px 20px 16px",
  borderBottom: "1px solid #f0f0f0",
};

const logoIcon: React.CSSProperties = {
  width: "32px",
  height: "32px",
  background: "#1a1a1a",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
};

const logoText: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#1a1a1a",
  letterSpacing: "-0.3px",
};

const navStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: "12px 8px",
};

const groupHeaderStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  width: "100%",
  padding: "8px 12px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  borderRadius: "6px",
  transition: "background 0.15s",
};

const groupHeaderText: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  flex: 1,
  textAlign: "left",
};

const topicButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  padding: "7px 12px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "13.5px",
  color: "#374151",
  fontWeight: 400,
  transition: "background 0.15s",
  textAlign: "left",
};

const topicIconStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "#9ca3af",
};

const leafTopicStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "7px 12px",
  fontSize: "13.5px",
  color: "#374151",
  borderRadius: "6px",
  cursor: "default",
};

const contentItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  width: "100%",
  padding: "6px 12px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  borderRadius: "6px",
  fontSize: "13px",
  color: "#6b7280",
  fontWeight: 400,
  transition: "all 0.15s",
  textAlign: "left",
};

const activeContentStyle: React.CSSProperties = {
  background: "#eef2ff",
  color: "#346DDB",
  fontWeight: 500,
};

const contentDotStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const contentIconStyle: React.CSSProperties = {
  width: "18px",
  height: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  color: "#9ca3af",
};
