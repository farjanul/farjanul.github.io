"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "../AppContext";
import { 
  createTopic, updateTopic, deleteTopic, getTopics, 
  createContentGroup, updateContentGroup, deleteContentGroup, getContentGroups, 
  createContent, updateContent, deleteContent, getContents,
  bulkDeleteGroups, bulkDeleteTopics, bulkDeleteContents
} from "../actions";
import { slugify } from "../../lib/slug";
import TiptapEditor from "../../components/TiptapEditor";
import IconPicker from "../../components/IconPicker";

type ScreenType = 
  | "content-list" 
  | "add-content" 
  | "topic-list" 
  | "add-topic" 
  | "group-list" 
  | "add-group";

export default function ContentManagementPage() {
  const { isAdmin, setIsAdmin } = useAppContext();
  const router = useRouter();

  // Active Screen / Page view
  const [activeScreen, setActiveScreen] = useState<ScreenType>("content-list");

  // Database Data States
  const [topics, setTopics] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [contentsList, setContentsList] = useState<any[]>([]);
  const [success, setSuccess] = useState("");

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGroupId, setFilterGroupId] = useState<number>(0);
  const [filterTopicId, setFilterTopicId] = useState<number>(0);

  // Bulk Selection States
  const [selectedGroupIds, setSelectedGroupIds] = useState<number[]>([]);
  const [selectedTopicIds, setSelectedTopicIds] = useState<number[]>([]);
  const [selectedContentIds, setSelectedContentIds] = useState<number[]>([]);

  // Edit Mode States
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editingContentId, setEditingContentId] = useState<number | null>(null);

  // Form Data States
  const [groupData, setGroupData] = useState({ name: "", position: 0 });
  const [topicData, setTopicData] = useState({ group_id: 0, title: "", icon: "", position: 0 });
  const [contentData, setContentData] = useState({ group_id: 0, topic_id: 0, title: "", slug: "", icon: "", body_en: "", body_bn: "", position: 0 });

  const loadAllData = () => {
    getTopics().then(setTopics);
    getContentGroups().then(setGroups);
    getContents().then(setContentsList);
  };

  useEffect(() => {
    loadAllData();

    // Parse initial URL query if any (e.g. ?screen=add-content)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const screenParam = params.get("screen") as ScreenType;
      if (screenParam) {
        setActiveScreen(screenParam);
      }
    }
  }, []);

  const switchScreen = (screen: ScreenType) => {
    setActiveScreen(screen);
    setSearchQuery("");
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("screen", screen);
      window.history.pushState({}, "", url.toString());
    }
  };

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    loadAllData();
    setTimeout(() => setSuccess(""), 3500);
  };

  const resetGroupForm = () => {
    setGroupData({ name: "", position: 0 });
    setEditingGroupId(null);
  };

  const resetTopicForm = () => {
    setTopicData({ group_id: 0, title: "", icon: "", position: 0 });
    setEditingTopicId(null);
  };

  const resetContentForm = () => {
    setContentData({ group_id: 0, topic_id: 0, title: "", slug: "", icon: "", body_en: "", body_bn: "", position: 0 });
    setEditingContentId(null);
  };

  // Filtered lists based on search and dropdown filters
  const filteredGroups = useMemo(() => {
    return groups.filter((g) => g.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [groups, searchQuery]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = filterGroupId === 0 || t.group_id === filterGroupId;
      return matchSearch && matchGroup;
    });
  }, [topics, searchQuery, filterGroupId]);

  const filteredContents = useMemo(() => {
    return contentsList.filter((c) => {
      const matchSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGroup = filterGroupId === 0 || c.group_id === filterGroupId;
      const matchTopic = filterTopicId === 0 || c.topic_id === filterTopicId;
      return matchSearch && matchGroup && matchTopic;
    });
  }, [contentsList, searchQuery, filterGroupId, filterTopicId]);

  // Bulk Selection Handlers
  const toggleSelectGroup = (id: number) => {
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllGroups = () => {
    if (selectedGroupIds.length === filteredGroups.length) {
      setSelectedGroupIds([]);
    } else {
      setSelectedGroupIds(filteredGroups.map((g) => g.id));
    }
  };

  const toggleSelectTopic = (id: number) => {
    setSelectedTopicIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllTopics = () => {
    if (selectedTopicIds.length === filteredTopics.length) {
      setSelectedTopicIds([]);
    } else {
      setSelectedTopicIds(filteredTopics.map((t) => t.id));
    }
  };

  const toggleSelectContent = (id: number) => {
    setSelectedContentIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllContents = () => {
    if (selectedContentIds.length === filteredContents.length) {
      setSelectedContentIds([]);
    } else {
      setSelectedContentIds(filteredContents.map((c) => c.id));
    }
  };

  // Bulk Delete Actions
  const handleBulkDeleteGroups = async () => {
    if (!selectedGroupIds.length) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedGroupIds.length} groups? All nested topics and contents will also be permanently deleted!`
      )
    ) {
      await bulkDeleteGroups(selectedGroupIds);
      setSelectedGroupIds([]);
      showSuccess(`${selectedGroupIds.length} groups deleted successfully!`);
    }
  };

  const handleBulkDeleteTopics = async () => {
    if (!selectedTopicIds.length) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedTopicIds.length} topics? All associated contents will also be permanently deleted!`
      )
    ) {
      await bulkDeleteTopics(selectedTopicIds);
      setSelectedTopicIds([]);
      showSuccess(`${selectedTopicIds.length} topics deleted successfully!`);
    }
  };

  const handleBulkDeleteContents = async () => {
    if (!selectedContentIds.length) return;
    if (
      confirm(
        `Are you sure you want to delete ${selectedContentIds.length} contents?`
      )
    ) {
      await bulkDeleteContents(selectedContentIds);
      setSelectedContentIds([]);
      showSuccess(`${selectedContentIds.length} contents deleted successfully!`);
    }
  };

  // Handlers for Save / Edit / Delete
  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroupId) {
      await updateContentGroup(editingGroupId, { name: groupData.name, position: Number(groupData.position) });
      showSuccess("Group updated successfully!");
    } else {
      await createContentGroup({ name: groupData.name, position: Number(groupData.position) });
      showSuccess("New group created successfully!");
    }
    resetGroupForm();
    switchScreen("group-list");
  };

  const startEditGroup = (g: any) => {
    setEditingGroupId(g.id);
    setGroupData({ name: g.name, position: g.position });
    switchScreen("add-group");
  };

  const handleDeleteGroup = async (id: number) => {
    if (confirm("Are you sure you want to delete this group? All nested topics and contents will also be deleted.")) {
      await deleteContentGroup(id);
      showSuccess("Group deleted successfully!");
    }
  };

  const handleSaveTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      group_id: Number(topicData.group_id), 
      title: topicData.title, 
      icon: topicData.icon ? topicData.icon : null, 
      position: Number(topicData.position) 
    };
    if (editingTopicId) {
      await updateTopic(editingTopicId, payload);
      showSuccess("Topic updated successfully!");
    } else {
      await createTopic(payload);
      showSuccess("New topic created successfully!");
    }
    resetTopicForm();
    switchScreen("topic-list");
  };

  const startEditTopic = (t: any) => {
    setEditingTopicId(t.id);
    setTopicData({ group_id: t.group_id, title: t.title, icon: t.icon || "", position: t.position });
    switchScreen("add-topic");
  };

  const handleDeleteTopic = async (id: number) => {
    if (confirm("Are you sure you want to delete this topic? All nested contents will also be deleted.")) {
      await deleteTopic(id);
      showSuccess("Topic deleted successfully!");
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      group_id: Number(contentData.group_id),
      topic_id: contentData.topic_id ? Number(contentData.topic_id) : null,
      title: contentData.title,
      slug: contentData.slug ? slugify(contentData.slug) : slugify(contentData.title),
      icon: contentData.icon ? contentData.icon : null,
      body_en: contentData.body_en,
      body_bn: contentData.body_bn,
      position: Number(contentData.position)
    };
    if (editingContentId) {
      await updateContent(editingContentId, payload as any);
      showSuccess("Content updated successfully!");
    } else {
      await createContent(payload as any);
      showSuccess("New content created successfully!");
    }
    resetContentForm();
    switchScreen("content-list");
  };

  const startEditContent = (c: any) => {
    setEditingContentId(c.id);
    setContentData({ 
      group_id: c.group_id, 
      topic_id: c.topic_id || 0, 
      title: c.title, 
      slug: c.slug || slugify(c.title),
      icon: c.icon || "",
      body_en: c.body_en, 
      body_bn: c.body_bn, 
      position: c.position 
    });
    switchScreen("add-content");
  };

  const handleDuplicateContent = async (c: any) => {
    await createContent({
      group_id: c.group_id,
      topic_id: c.topic_id || undefined,
      title: `${c.title} (Copy)`,
      slug: `${c.slug || slugify(c.title)}-copy`,
      icon: c.icon || undefined,
      body_en: c.body_en,
      body_bn: c.body_bn,
      position: c.position + 1,
    });
    showSuccess(`Copy created for "${c.title}"!`);
  };

  const handleDeleteContent = async (id: number) => {
    if (confirm("Are you sure you want to delete this content?")) {
      await deleteContent(id);
      showSuccess("Content deleted successfully!");
    }
  };

  if (!isAdmin) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "48px", textAlign: "center", maxWidth: "420px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: "52px", marginBottom: "16px" }}>🔐</div>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#0f172a", marginBottom: "8px" }}>Access Restricted</h2>
          <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "24px" }}>Please log in as an administrator to manage or delete content.</p>
          <a href="/admin" style={{ background: "#0284c7", color: "white", padding: "12px 28px", borderRadius: "8px", textDecoration: "none", fontSize: "14px", fontWeight: "600", display: "inline-block", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)" }}>Go to Login</a>
        </div>
      </div>
    );
  }

  // Common UI Styles
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: "8px",
    border: "1.5px solid #cbd5e1",
    fontSize: "14px",
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
    marginTop: "4px",
  };

  const labelStyle: React.CSSProperties = { display: "block", fontSize: "13px", fontWeight: "600", color: "#334155", marginBottom: "2px" };
  
  const btnPrimary: React.CSSProperties = {
    padding: "11px 26px", borderRadius: "8px", border: "none", background: "#0284c7", color: "white",
    fontSize: "14px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 2px 8px rgba(2, 132, 199, 0.3)"
  };

  const actionBtnStyle = (color: string) => ({
    background: "white",
    border: `1px solid ${color}`,
    color: color,
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600" as const,
    cursor: "pointer",
    marginLeft: "6px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px"
  });

  const selectedGroup = groups.find(g => g.id === Number(contentData.group_id));
  const availableTopics = selectedGroup?.topics || [];

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", display: "flex", flexDirection: "column" }}>
      
      {/* Top Navbar */}
      <header style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "16px 24px", position: "sticky", top: 0, zIndex: 40, boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
        <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #0284c7, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "18px", boxShadow: "0 2px 6px rgba(2,132,199,0.3)" }}>
              <i className="fa-solid fa-cube"></i>
            </div>
            <div>
              <h1 style={{ fontSize: "18px", fontWeight: "800", color: "#0f172a", margin: 0, lineHeight: 1.2 }}>CMS Console</h1>
              <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Content & Structure Management</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={() => {
                import("@/app/admin/actions").then((module) => {
                  module.logoutUser().then(() => {
                    setIsAdmin(false);
                    router.push("/admin");
                  });
                });
              }}
              style={{ padding: "8px 16px", borderRadius: "8px", background: "#fee2e2", color: "#b91c1c", border: "none", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> Logout
            </button>
            <a href="/" style={{ padding: "8px 16px", borderRadius: "8px", background: "#0f172a", color: "white", textDecoration: "none", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
              <i className="fa-solid fa-arrow-left"></i> Back to Site
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div style={{ maxWidth: "1300px", margin: "24px auto", padding: "0 24px", width: "100%", boxSizing: "border-box", display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "start" }}>
        
        {/* Left Navigation Sidebar */}
        <aside style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "16px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)", position: "sticky", top: "96px" }}>
          
          {/* Section 1: Lists */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", padding: "6px 10px", marginBottom: "4px" }}>
              📋 Lists
            </div>
            
            <button
              onClick={() => switchScreen("content-list")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeScreen === "content-list" ? "#f0f9ff" : "transparent",
                color: activeScreen === "content-list" ? "#0284c7" : "#334155",
                fontWeight: activeScreen === "content-list" ? "700" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: "4px",
                transition: "all 0.15s"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-regular fa-file-lines" style={{ width: "16px" }}></i> Content List
              </span>
              <span style={{ background: activeScreen === "content-list" ? "#bae6fd" : "#f1f5f9", color: activeScreen === "content-list" ? "#0369a1" : "#64748b", fontSize: "11px", padding: "2px 7px", borderRadius: "10px", fontWeight: "600" }}>
                {contentsList.length}
              </span>
            </button>

            <button
              onClick={() => switchScreen("topic-list")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeScreen === "topic-list" ? "#f0f9ff" : "transparent",
                color: activeScreen === "topic-list" ? "#0284c7" : "#334155",
                fontWeight: activeScreen === "topic-list" ? "700" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: "4px",
                transition: "all 0.15s"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-solid fa-layer-group" style={{ width: "16px" }}></i> Topic List
              </span>
              <span style={{ background: activeScreen === "topic-list" ? "#bae6fd" : "#f1f5f9", color: activeScreen === "topic-list" ? "#0369a1" : "#64748b", fontSize: "11px", padding: "2px 7px", borderRadius: "10px", fontWeight: "600" }}>
                {topics.length}
              </span>
            </button>

            <button
              onClick={() => switchScreen("group-list")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeScreen === "group-list" ? "#f0f9ff" : "transparent",
                color: activeScreen === "group-list" ? "#0284c7" : "#334155",
                fontWeight: activeScreen === "group-list" ? "700" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s"
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <i className="fa-regular fa-folder" style={{ width: "16px" }}></i> Group List
              </span>
              <span style={{ background: activeScreen === "group-list" ? "#bae6fd" : "#f1f5f9", color: activeScreen === "group-list" ? "#0369a1" : "#64748b", fontSize: "11px", padding: "2px 7px", borderRadius: "10px", fontWeight: "600" }}>
                {groups.length}
              </span>
            </button>
          </div>

          <div style={{ height: "1px", background: "#f1f5f9", margin: "16px 0" }}></div>

          {/* Section 2: Create / Add */}
          <div>
            <div style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748b", padding: "6px 10px", marginBottom: "4px" }}>
              ➕ Create New
            </div>

            <button
              onClick={() => { resetContentForm(); switchScreen("add-content"); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeScreen === "add-content" ? "#ecfdf5" : "transparent",
                color: activeScreen === "add-content" ? "#059669" : "#334155",
                fontWeight: activeScreen === "add-content" ? "700" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: "4px",
                transition: "all 0.15s"
              }}
            >
              <i className="fa-solid fa-plus-circle" style={{ width: "16px", color: "#10b981" }}></i> Add Content
            </button>

            <button
              onClick={() => { resetTopicForm(); switchScreen("add-topic"); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeScreen === "add-topic" ? "#ecfdf5" : "transparent",
                color: activeScreen === "add-topic" ? "#059669" : "#334155",
                fontWeight: activeScreen === "add-topic" ? "700" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                marginBottom: "4px",
                transition: "all 0.15s"
              }}
            >
              <i className="fa-solid fa-plus-circle" style={{ width: "16px", color: "#10b981" }}></i> Add Topic
            </button>

            <button
              onClick={() => { resetGroupForm(); switchScreen("add-group"); }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "none",
                background: activeScreen === "add-group" ? "#ecfdf5" : "transparent",
                color: activeScreen === "add-group" ? "#059669" : "#334155",
                fontWeight: activeScreen === "add-group" ? "700" : "500",
                fontSize: "14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s"
              }}
            >
              <i className="fa-solid fa-plus-circle" style={{ width: "16px", color: "#10b981" }}></i> Add Group
            </button>
          </div>
        </aside>

        {/* Right Main Screen Container */}
        <main style={{ minWidth: 0 }}>
          
          {/* Success Banner */}
          {success && (
            <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", borderRadius: "10px", padding: "14px 18px", color: "#065f46", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)" }}>
              <i className="fa-solid fa-circle-check" style={{ fontSize: "18px" }}></i>
              {success}
            </div>
          )}

          {/* ==================================================== */}
          {/* SCREEN 1: CONTENT LIST SCREEN */}
          {/* ==================================================== */}
          {activeScreen === "content-list" && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fa-regular fa-file-lines" style={{ color: "#0284c7" }}></i> Content List ({filteredContents.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>View, filter, edit, duplicate, or bulk delete articles</p>
                </div>

                <button
                  onClick={() => { resetContentForm(); switchScreen("add-content"); }}
                  style={btnPrimary}
                >
                  <i className="fa-solid fa-plus"></i> Add New Content
                </button>
              </div>

              {/* Filters and Search Toolbar */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  {/* Group Filter */}
                  <select
                    value={filterGroupId}
                    onChange={(e) => {
                      setFilterGroupId(Number(e.target.value));
                      setFilterTopicId(0);
                    }}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", background: "white", color: "#334155", fontWeight: "500" }}
                  >
                    <option value={0}>📁 All Groups</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>

                  {/* Topic Filter */}
                  <select
                    value={filterTopicId}
                    onChange={(e) => setFilterTopicId(Number(e.target.value))}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", background: "white", color: "#334155", fontWeight: "500" }}
                  >
                    <option value={0}>🗂 All Topics</option>
                    {topics
                      .filter((t) => filterGroupId === 0 || t.group_id === filterGroupId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>{t.title}</option>
                      ))}
                  </select>

                  {/* Search Input */}
                  <input
                    type="text"
                    placeholder="🔍 Search content..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", width: "200px", background: "white" }}
                  />
                </div>

                {/* Bulk Delete Button */}
                {selectedContentIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteContents}
                    style={{ background: "#ef4444", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)" }}
                  >
                    <i className="fa-solid fa-trash-can"></i> Bulk Delete ({selectedContentIds.length})
                  </button>
                )}
              </div>

              {/* Select All Checkbox Header */}
              {filteredContents.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedContentIds.length === filteredContents.length && filteredContents.length > 0}
                      onChange={toggleSelectAllContents}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    Select All
                  </label>
                  <span>{selectedContentIds.length} selected</span>
                </div>
              )}

              {/* Items List */}
              {filteredContents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#64748b" }}>
                  <i className="fa-regular fa-folder-open" style={{ fontSize: "36px", color: "#cbd5e1", marginBottom: "12px", display: "block" }}></i>
                  No content found.
                </div>
              ) : (
                filteredContents.map(c => {
                  const groupName = groups.find(g => g.id === c.group_id)?.name;
                  const topicName = topics.find(t => t.id === c.topic_id)?.title;
                  const isChecked = selectedContentIds.includes(c.id);

                  return (
                    <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: isChecked ? "#f0fdf4" : "#ffffff", borderRadius: "10px", marginBottom: "8px", border: isChecked ? "1.5px solid #86efac" : "1px solid #e2e8f0", transition: "all 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectContent(c.id)}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <div>
                          <div style={{ fontSize: "15px", color: "#0f172a", fontWeight: "600", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                            {c.icon && <i className={c.icon} style={{ color: "#0284c7", fontSize: "14px" }}></i>}
                            <span>{c.title}</span>
                            <span style={{ color: "#64748b", fontSize: "12px", marginLeft: "8px", fontWeight: "400" }}>(Position: {c.position})</span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                            <span>Group: <strong style={{ color: "#0284c7" }}>{groupName}</strong></span>
                            {topicName ? <span>› Topic: <strong style={{ color: "#475569" }}>{topicName}</strong></span> : <span>› Direct in Group</span>}
                            {c.slug && (
                              <a
                                href={`/${c.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ marginLeft: "8px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", color: "#334155", fontFamily: "monospace", fontSize: "11px", textDecoration: "none", border: "1px solid #e2e8f0" }}
                                title="Open content in new tab"
                              >
                                /{c.slug} <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: "10px", marginLeft: "2px" }}></i>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <button
                          onClick={() => handleDuplicateContent(c)}
                          style={actionBtnStyle("#10b981")}
                          title="Create a copy"
                        >
                          <i className="fa-regular fa-copy"></i> Duplicate
                        </button>
                        <button
                          onClick={() => startEditContent(c)}
                          style={actionBtnStyle("#0284c7")}
                          title="Edit content"
                        >
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContent(c.id)}
                          style={actionBtnStyle("#ef4444")}
                          title="Delete content"
                        >
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* SCREEN 2: ADD / EDIT CONTENT FORM SCREEN */}
          {/* ==================================================== */}
          {activeScreen === "add-content" && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    {editingContentId ? "📝 Edit Content" : "➕ Add New Content"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Select group and topic, then write content in English and Bengali</p>
                </div>
                <button
                  onClick={() => switchScreen("content-list")}
                  style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  ← Back to Content List
                </button>
              </div>

              <form onSubmit={handleSaveContent}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Select Content Group *</label>
                    <select required style={{ ...inputStyle, cursor: "pointer" }} value={contentData.group_id} onChange={e => setContentData({...contentData, group_id: Number(e.target.value), topic_id: 0})}>
                      <option value={0} disabled>Select a group...</option>
                      {groups.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Topic (Optional)</label>
                    <select style={{ ...inputStyle, cursor: "pointer" }} value={contentData.topic_id} onChange={e => setContentData({...contentData, topic_id: Number(e.target.value)})} disabled={!contentData.group_id || availableTopics.length === 0}>
                      <option value={0}>No topic (Directly under Group)</option>
                      {availableTopics.map((t: any) => (<option key={t.id} value={t.id}>{t.title}</option>))}
                    </select>
                  </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                  <div>
                    <label style={labelStyle}>Title *</label>
                    <input
                      required
                      placeholder="e.g. Overview of System Design"
                      style={inputStyle}
                      value={contentData.title}
                      onChange={e => {
                        const newTitle = e.target.value;
                        setContentData(prev => ({
                          ...prev,
                          title: newTitle,
                          slug: (!prev.slug || prev.slug === slugify(prev.title)) ? slugify(newTitle) : prev.slug
                        }));
                      }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Slug (URL Key) *</label>
                    <input
                      required
                      placeholder="e.g. overview-of-system-design"
                      style={inputStyle}
                      value={contentData.slug}
                      onChange={e => setContentData({ ...contentData, slug: slugify(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Icon (Optional)</label>
                    <IconPicker value={contentData.icon} onChange={icon => setContentData({...contentData, icon})} />
                  </div>
                  <div>
                    <label style={labelStyle}>Position Order</label>
                    <input type="number" style={inputStyle} value={contentData.position} onChange={e => setContentData({...contentData, position: Number(e.target.value)})} />
                  </div>
                </div>
                
                <div style={{ marginBottom: "20px" }}>
                  <label style={labelStyle}>Content Body (English)</label>
                  <TiptapEditor content={contentData.body_en} onChange={(html) => setContentData({...contentData, body_en: html})} />
                </div>
                <div style={{ marginBottom: "28px" }}>
                  <label style={labelStyle}>Content Body (Bengali)</label>
                  <TiptapEditor content={contentData.body_bn} onChange={(html) => setContentData({...contentData, body_bn: html})} />
                </div>
                
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button type="submit" style={btnPrimary}>
                    <i className="fa-solid fa-cloud-arrow-up"></i> {editingContentId ? "Update Content" : "Save Content"}
                  </button>
                  <button type="button" onClick={() => { resetContentForm(); switchScreen("content-list"); }} style={{ ...btnPrimary, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", boxShadow: "none" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCREEN 3: TOPIC LIST SCREEN */}
          {/* ==================================================== */}
          {activeScreen === "topic-list" && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fa-solid fa-layer-group" style={{ color: "#0284c7" }}></i> Topic List ({filteredTopics.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>View, filter, edit, or bulk delete topics</p>
                </div>

                <button
                  onClick={() => { resetTopicForm(); switchScreen("add-topic"); }}
                  style={btnPrimary}
                >
                  <i className="fa-solid fa-plus"></i> Add New Topic
                </button>
              </div>

              {/* Filters and Search Toolbar */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={filterGroupId}
                    onChange={(e) => setFilterGroupId(Number(e.target.value))}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", background: "white", color: "#334155", fontWeight: "500" }}
                  >
                    <option value={0}>📁 All Groups</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="🔍 Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", width: "200px", background: "white" }}
                  />
                </div>

                {selectedTopicIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteTopics}
                    style={{ background: "#ef4444", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)" }}
                  >
                    <i className="fa-solid fa-trash-can"></i> Bulk Delete ({selectedTopicIds.length})
                  </button>
                )}
              </div>

              {/* Select All Checkbox Header */}
              {filteredTopics.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedTopicIds.length === filteredTopics.length && filteredTopics.length > 0}
                      onChange={toggleSelectAllTopics}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    Select All
                  </label>
                  <span>{selectedTopicIds.length} selected</span>
                </div>
              )}

              {/* Items List */}
              {filteredTopics.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#64748b" }}>
                  No topics found.
                </div>
              ) : (
                filteredTopics.map(t => {
                  const groupName = groups.find(g => g.id === t.group_id)?.name;
                  const isChecked = selectedTopicIds.includes(t.id);

                  return (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: isChecked ? "#f0fdf4" : "#ffffff", borderRadius: "10px", marginBottom: "8px", border: isChecked ? "1.5px solid #86efac" : "1px solid #e2e8f0", transition: "all 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectTopic(t.id)}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <div style={{ fontSize: "15px", color: "#0f172a", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                          {t.icon && <i className={t.icon} style={{ color: "#0284c7" }}></i>}
                          {t.title}
                          <span style={{ color: "#64748b", fontSize: "12px", fontWeight: "400" }}>(Group: <strong>{groupName}</strong>, Position: {t.position})</span>
                        </div>
                      </div>
                      <div>
                        <button onClick={() => startEditTopic(t)} style={actionBtnStyle("#0284c7")}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button onClick={() => handleDeleteTopic(t.id)} style={actionBtnStyle("#ef4444")}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* SCREEN 4: ADD / EDIT TOPIC FORM SCREEN */}
          {/* ==================================================== */}
          {activeScreen === "add-topic" && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    {editingTopicId ? "🗂 Edit Topic" : "➕ Add New Topic"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Select group, enter title and select an icon</p>
                </div>
                <button
                  onClick={() => switchScreen("topic-list")}
                  style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  ← Back to Topic List
                </button>
              </div>

              <form onSubmit={handleSaveTopic}>
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Select Content Group *</label>
                  <select required style={{ ...inputStyle, cursor: "pointer" }} value={topicData.group_id} onChange={e => setTopicData({...topicData, group_id: Number(e.target.value)})}>
                    <option value={0} disabled>Select a group...</option>
                    {groups.map(g => (<option key={g.id} value={g.id}>{g.name}</option>))}
                  </select>
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>Topic Title *</label>
                  <input required placeholder="e.g. Introduction" style={inputStyle} value={topicData.title} onChange={e => setTopicData({...topicData, title: e.target.value})} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div><label style={labelStyle}>FontAwesome Icon</label><IconPicker value={topicData.icon} onChange={icon => setTopicData({...topicData, icon})} /></div>
                  <div><label style={labelStyle}>Position Order</label><input type="number" style={inputStyle} value={topicData.position} onChange={e => setTopicData({...topicData, position: Number(e.target.value)})} /></div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button type="submit" style={btnPrimary}>
                    <i className="fa-solid fa-cloud-arrow-up"></i> {editingTopicId ? "Update Topic" : "Save Topic"}
                  </button>
                  <button type="button" onClick={() => { resetTopicForm(); switchScreen("topic-list"); }} style={{ ...btnPrimary, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", boxShadow: "none" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================== */}
          {/* SCREEN 5: GROUP LIST SCREEN */}
          {/* ==================================================== */}
          {activeScreen === "group-list" && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "28px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="fa-regular fa-folder" style={{ color: "#0284c7" }}></i> Group List ({filteredGroups.length})
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Manage categories or main sections and perform bulk delete</p>
                </div>

                <button
                  onClick={() => { resetGroupForm(); switchScreen("add-group"); }}
                  style={btnPrimary}
                >
                  <i className="fa-solid fa-plus"></i> Add New Group
                </button>
              </div>

              {/* Search and Bulk Controls */}
              <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                <input
                  type="text"
                  placeholder="🔍 Search groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: "8px", border: "1.5px solid #cbd5e1", fontSize: "13px", outline: "none", width: "240px", background: "white" }}
                />

                {selectedGroupIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteGroups}
                    style={{ background: "#ef4444", color: "white", padding: "8px 16px", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)" }}
                  >
                    <i className="fa-solid fa-trash-can"></i> Bulk Delete ({selectedGroupIds.length})
                  </button>
                )}
              </div>

              {/* Select All Checkbox Header */}
              {filteredGroups.length > 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#f1f5f9", borderRadius: "8px", marginBottom: "12px", fontSize: "13px", color: "#475569", fontWeight: "600" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.length === filteredGroups.length && filteredGroups.length > 0}
                      onChange={toggleSelectAllGroups}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    Select All
                  </label>
                  <span>{selectedGroupIds.length} selected</span>
                </div>
              )}

              {/* Items List */}
              {filteredGroups.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 24px", color: "#64748b" }}>
                  No groups found.
                </div>
              ) : (
                filteredGroups.map(g => {
                  const isChecked = selectedGroupIds.includes(g.id);
                  return (
                    <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: isChecked ? "#f0fdf4" : "#ffffff", borderRadius: "10px", marginBottom: "8px", border: isChecked ? "1.5px solid #86efac" : "1px solid #e2e8f0", transition: "all 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectGroup(g.id)}
                          style={{ width: "16px", height: "16px", cursor: "pointer" }}
                        />
                        <div style={{ fontSize: "15px", color: "#0f172a", fontWeight: "600" }}>
                          {g.name}
                          <span style={{ color: "#64748b", fontSize: "12px", marginLeft: "10px", fontWeight: "400" }}>(Position: {g.position}, Topics: {g.topics?.length || 0})</span>
                        </div>
                      </div>
                      <div>
                        <button onClick={() => startEditGroup(g)} style={actionBtnStyle("#0284c7")}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button onClick={() => handleDeleteGroup(g.id)} style={actionBtnStyle("#ef4444")}>
                          <i className="fa-solid fa-trash"></i> Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* SCREEN 6: ADD / EDIT GROUP FORM SCREEN */}
          {/* ==================================================== */}
          {activeScreen === "add-group" && (
            <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e2e8f0", padding: "32px", boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" }}>
                <div>
                  <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
                    {editingGroupId ? "📁 Edit Group" : "➕ Add New Group"}
                  </h2>
                  <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0" }}>Create or edit a main section/category group</p>
                </div>
                <button
                  onClick={() => switchScreen("group-list")}
                  style={{ background: "#f1f5f9", color: "#334155", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  ← Back to Group List
                </button>
              </div>

              <form onSubmit={handleSaveGroup}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
                  <div><label style={labelStyle}>Group Name *</label><input required placeholder="e.g. SYSTEM DESIGN" style={inputStyle} value={groupData.name} onChange={e => setGroupData({...groupData, name: e.target.value})} /></div>
                  <div><label style={labelStyle}>Position Order</label><input type="number" style={inputStyle} value={groupData.position} onChange={e => setGroupData({...groupData, position: Number(e.target.value)})} /></div>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <button type="submit" style={btnPrimary}>
                    <i className="fa-solid fa-cloud-arrow-up"></i> {editingGroupId ? "Update Group" : "Save Group"}
                  </button>
                  <button type="button" onClick={() => { resetGroupForm(); switchScreen("group-list"); }} style={{ ...btnPrimary, background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", boxShadow: "none" }}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
