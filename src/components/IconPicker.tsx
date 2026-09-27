"use client";
import { useState } from "react";

const COMMON_ICONS = [
  "fa-solid fa-house", "fa-solid fa-user", "fa-solid fa-check", "fa-solid fa-download",
  "fa-solid fa-image", "fa-solid fa-phone", "fa-solid fa-bars", "fa-solid fa-envelope",
  "fa-solid fa-star", "fa-solid fa-location-dot", "fa-solid fa-music", "fa-solid fa-wand-magic-sparkles",
  "fa-solid fa-heart", "fa-solid fa-arrow-right", "fa-solid fa-arrow-left", "fa-solid fa-circle-xmark",
  "fa-solid fa-bomb", "fa-solid fa-poop", "fa-solid fa-camera", "fa-solid fa-video", "fa-solid fa-pen",
  "fa-solid fa-paper-plane", "fa-solid fa-gem", "fa-solid fa-database", "fa-solid fa-server",
  "fa-solid fa-code", "fa-solid fa-terminal", "fa-solid fa-microchip", "fa-solid fa-laptop-code",
  "fa-brands fa-github", "fa-brands fa-js", "fa-brands fa-python", "fa-brands fa-react",
  "fa-solid fa-bug", "fa-solid fa-shield-halved", "fa-solid fa-key", "fa-solid fa-lock",
  "fa-solid fa-unlock", "fa-solid fa-gears", "fa-solid fa-wrench", "fa-solid fa-hammer",
  "fa-solid fa-rocket", "fa-solid fa-cloud", "fa-solid fa-earth-americas", "fa-solid fa-fire",
  "fa-solid fa-bolt", "fa-solid fa-droplet", "fa-solid fa-sun", "fa-solid fa-moon",
  "fa-solid fa-magnifying-glass", "fa-solid fa-bell", "fa-solid fa-book", "fa-solid fa-book-open",
  "fa-solid fa-file", "fa-solid fa-folder", "fa-solid fa-chart-line", "fa-solid fa-chart-pie",
  "fa-solid fa-clipboard", "fa-solid fa-calendar", "fa-solid fa-clock", "fa-solid fa-compass",
  "fa-solid fa-flag", "fa-solid fa-thumbs-up", "fa-solid fa-thumbs-down", "fa-solid fa-eye",
  "fa-solid fa-eye-slash", "fa-solid fa-play", "fa-solid fa-layer-group", "fa-solid fa-cubes",
  "fa-solid fa-network-wired", "fa-solid fa-sitemap", "fa-solid fa-diagram-project"
];

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

export default function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredIcons = COMMON_ICONS.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (icon: string) => {
    onChange(icon);
    setIsOpen(false);
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e5e7eb",
          fontSize: "14px", color: "black", outline: "none", boxSizing: "border-box", marginTop: "4px",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "white", minHeight: "44px"
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          {value ? (
            <>
              <i className={value} style={{ fontSize: '16px', width: '20px', textAlign: 'center', color: '#0284c7', flexShrink: 0 }}></i>
              <span style={{ fontWeight: 500, color: '#0f172a', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{value}</span>
            </>
          ) : (
            <span style={{ color: '#94a3b8' }}>None (No icon)</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {value ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              style={{
                background: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                lineHeight: 1,
                padding: 0
              }}
              title="Remove Icon (None)"
            >
              &times;
            </button>
          ) : null}
          <span style={{ color: "#9ca3af", fontSize: '11px' }}>▼</span>
        </div>
      </div>

      {isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'white', borderRadius: '12px', width: '800px', maxWidth: '90%', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>Select FontAwesome Icon</h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Choose an icon or select "None" to remove</p>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#6b7280', padding: 0, lineHeight: 1 }}>&times;</button>
            </div>

            {/* Quick None Action & Current Selection */}
            <div style={{ padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handleSelect("")}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 16px',
                  borderRadius: '8px',
                  background: !value ? '#eff6ff' : 'white',
                  border: !value ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                  color: !value ? '#1d4ed8' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <i className="fa-solid fa-ban" style={{ color: '#ef4444' }}></i>
                None (আইকন রিমুভ করুন)
              </button>

              {value && (
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Currently selected:</span>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <i className={value}></i> {value}
                  </span>
                </div>
              )}
            </div>
            
            {/* Search Input */}
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <input 
                autoFocus
                placeholder="Search icons (e.g. server, code, book, cloud)..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', fontSize: '14px', outline: 'none', boxSizing: 'border-box', color: 'black' }}
              />
            </div>
            
            {/* Icon Grid */}
            <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(56px, 1fr))', gap: '8px' }}>
              <div 
                onClick={() => handleSelect("")}
                style={{ 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                  padding: '12px 8px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', 
                  background: value === "" ? '#eff6ff' : 'white', borderColor: value === "" ? '#3b82f6' : '#e5e7eb' 
                }}
                title="None (No icon)"
              >
                <i className="fa-solid fa-ban" style={{ fontSize: '18px', color: '#ef4444' }}></i>
                <span style={{ fontSize: '10px', marginTop: '4px', color: '#64748b', fontWeight: 600 }}>None</span>
              </div>

              {filteredIcons.map(icon => (
                <div 
                  key={icon} 
                  onClick={() => handleSelect(icon)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    padding: '12px 8px', borderRadius: '8px', border: '1px solid #e5e7eb', cursor: 'pointer', 
                    background: value === icon ? '#eff6ff' : 'white', borderColor: value === icon ? '#3b82f6' : '#e5e7eb', 
                    transition: 'all 0.1s' 
                  }}
                  title={icon}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#3b82f6'}
                  onMouseOut={e => e.currentTarget.style.borderColor = value === icon ? '#3b82f6' : '#e5e7eb'}
                >
                  <i className={icon} style={{ fontSize: '20px', color: value === icon ? '#3b82f6' : '#4b5563' }}></i>
                </div>
              ))}

              {filteredIcons.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#6b7280', padding: '30px 0', fontSize: '14px' }}>
                  No matching icons found.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
