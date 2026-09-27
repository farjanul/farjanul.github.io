"use client";

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, common } from 'lowlight';
import { 
  Undo, Redo, 
  Heading1, Heading2, Heading3, Pilcrow,
  Bold, Italic, Strikethrough, Code,
  List, ListOrdered, Quote, CodeSquare,
  AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon, RemoveFormatting,
  Maximize, Minimize,
  Table as TableIcon, Columns, Rows, Trash2, Plus
} from 'lucide-react';

const lowlight = createLowlight(common);

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const Divider = () => (
  <div style={{ width: '1px', height: '24px', background: '#e5e7eb', margin: '0 6px' }} />
);

const MenuBar = ({ editor, isFullscreen, toggleFullscreen }: { editor: any, isFullscreen: boolean, toggleFullscreen: () => void }) => {
  if (!editor) {
    return null;
  }

  const btnStyle = (active: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '32px',
    height: '32px',
    padding: '0 6px',
    borderRadius: '6px',
    background: active ? '#e0f2fe' : 'transparent',
    color: active ? '#0284c7' : '#4b5563',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontSize: '13px',
    fontWeight: active ? ('600' as const) : ('400' as const),
  });

  const addImage = () => {
    const url = window.prompt('Image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', previousUrl);
    
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const isTableActive = editor.isActive('table');
  const isCodeBlockActive = editor.isActive('codeBlock');
  const currentLang = isCodeBlockActive ? (editor.getAttributes('codeBlock').language || 'auto') : 'auto';

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '8px 12px', 
      borderBottom: '1px solid #e5e7eb',
      background: '#fafafa',
      flexWrap: 'wrap',
      gap: '6px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '3px' }}>
        {/* Undo / Redo */}
        <button type="button" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} style={btnStyle(false)} title="Undo"><Undo size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} style={btnStyle(false)} title="Redo"><Redo size={16} /></button>
        
        <Divider />

        {/* Headings & Paragraph */}
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} style={btnStyle(editor.isActive('heading', { level: 1 }))} title="Heading 1"><Heading1 size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} style={btnStyle(editor.isActive('heading', { level: 2 }))} title="Heading 2"><Heading2 size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} style={btnStyle(editor.isActive('heading', { level: 3 }))} title="Heading 3"><Heading3 size={18} /></button>
        <button type="button" onClick={() => editor.chain().focus().setParagraph().run()} style={btnStyle(editor.isActive('paragraph'))} title="Paragraph"><Pilcrow size={16} /></button>

        <Divider />

        {/* Marks */}
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} style={btnStyle(editor.isActive('bold'))} title="Bold"><Bold size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} style={btnStyle(editor.isActive('italic'))} title="Italic"><Italic size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} style={btnStyle(editor.isActive('strike'))} title="Strike"><Strikethrough size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} style={btnStyle(editor.isActive('code'))} title="Inline Code"><Code size={16} /></button>

        <Divider />

        {/* Lists & Quotes */}
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} style={btnStyle(editor.isActive('bulletList'))} title="Bullet List"><List size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} style={btnStyle(editor.isActive('orderedList'))} title="Numbered List"><ListOrdered size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} style={btnStyle(editor.isActive('blockquote'))} title="Quote"><Quote size={16} /></button>

        <Divider />

        {/* Code Snippet / CodeBlock */}
        <button 
          type="button" 
          onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
          style={btnStyle(isCodeBlockActive)} 
          title="Code Snippet / Code Block"
        >
          <CodeSquare size={16} />
        </button>

        {/* Code Language Dropdown */}
        <select
          value={currentLang}
          onChange={(e) => {
            const val = e.target.value;
            if (!isCodeBlockActive) {
              editor.chain().focus().toggleCodeBlock({ language: val === 'auto' ? undefined : val }).run();
            } else {
              editor.chain().focus().updateAttributes('codeBlock', { language: val === 'auto' ? null : val }).run();
            }
          }}
          style={{
            fontSize: '11px',
            padding: '2px 6px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: 'white',
            color: '#374151',
            cursor: 'pointer',
            height: '30px',
            outline: 'none',
          }}
          title="Code Snippet Language"
        >
          <option value="auto">Auto / Code</option>
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="html">HTML / XML</option>
          <option value="css">CSS</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash / Shell</option>
          <option value="json">JSON</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
          <option value="csharp">C#</option>
          <option value="go">Go</option>
          <option value="rust">Rust</option>
          <option value="php">PHP</option>
        </select>

        <Divider />

        {/* Table Insert & Controls */}
        <button 
          type="button" 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
          style={btnStyle(isTableActive)} 
          title="Insert Table (3x3)"
        >
          <TableIcon size={16} />
        </button>

        {/* Contextual Table Tools (when cursor is inside table) */}
        {isTableActive && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', background: '#f1f5f9', padding: '2px 4px', borderRadius: '6px' }}>
            <button 
              type="button" 
              onClick={() => editor.chain().focus().addColumnAfter().run()} 
              style={{ ...btnStyle(false), fontSize: '11px', height: '26px', gap: '3px' }} 
              title="Add Column Right"
            >
              <Columns size={13} /><Plus size={10} style={{ marginLeft: '-4px' }} />
            </button>
            <button 
              type="button" 
              onClick={() => editor.chain().focus().deleteColumn().run()} 
              style={{ ...btnStyle(false), fontSize: '11px', height: '26px', color: '#ef4444' }} 
              title="Delete Column"
            >
              <Columns size={13} /><Trash2 size={10} style={{ marginLeft: '-4px' }} />
            </button>
            <button 
              type="button" 
              onClick={() => editor.chain().focus().addRowAfter().run()} 
              style={{ ...btnStyle(false), fontSize: '11px', height: '26px', gap: '3px' }} 
              title="Add Row Below"
            >
              <Rows size={13} /><Plus size={10} style={{ marginLeft: '-4px' }} />
            </button>
            <button 
              type="button" 
              onClick={() => editor.chain().focus().deleteRow().run()} 
              style={{ ...btnStyle(false), fontSize: '11px', height: '26px', color: '#ef4444' }} 
              title="Delete Row"
            >
              <Rows size={13} /><Trash2 size={10} style={{ marginLeft: '-4px' }} />
            </button>
            <button 
              type="button" 
              onClick={() => editor.chain().focus().deleteTable().run()} 
              style={{ ...btnStyle(false), height: '26px', color: '#ef4444' }} 
              title="Delete Entire Table"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        <Divider />

        {/* Alignment */}
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} style={btnStyle(editor.isActive({ textAlign: 'left' }))} title="Align Left"><AlignLeft size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} style={btnStyle(editor.isActive({ textAlign: 'center' }))} title="Align Center"><AlignCenter size={16} /></button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} style={btnStyle(editor.isActive({ textAlign: 'right' }))} title="Align Right"><AlignRight size={16} /></button>

        <Divider />

        {/* Media & Links */}
        <button type="button" onClick={setLink} style={btnStyle(editor.isActive('link'))} title="Link"><LinkIcon size={16} /></button>
        <button type="button" onClick={addImage} style={btnStyle(false)} title="Image"><ImageIcon size={16} /></button>

        <Divider />

        {/* Clear Formatting */}
        <button type="button" onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} style={btnStyle(false)} title="Clear Formatting"><RemoveFormatting size={16} /></button>
      </div>

      <div>
        <button type="button" onClick={toggleFullscreen} style={btnStyle(isFullscreen)} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
          {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
        </button>
      </div>
    </div>
  );
};

export default function TiptapEditor({ content, onChange }: TiptapEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // hand over to CodeBlockLowlight
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-content',
        style: `min-height: ${isFullscreen ? 'calc(100vh - 100px)' : '240px'}; padding: 24px; outline: none; color: black; font-size: 15px; line-height: 1.6; max-width: 1200px; margin: 0 auto;`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || "");
    }
  }, [content, editor]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <div style={
      isFullscreen 
      ? { 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 99999, 
          background: '#f3f4f6',
          display: 'flex', 
          flexDirection: 'column'
        } 
      : {
          border: '1px solid #e5e7eb', 
          borderRadius: '8px', 
          background: 'white',
          overflow: 'hidden',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
        }
    }>
      <MenuBar editor={editor} isFullscreen={isFullscreen} toggleFullscreen={toggleFullscreen} />
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        background: isFullscreen ? '#f3f4f6' : 'white' 
      }}>
        <div style={{
          background: 'white',
          minHeight: '100%',
          boxShadow: isFullscreen ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : 'none',
          maxWidth: isFullscreen ? '1200px' : '100%',
          margin: isFullscreen ? '24px auto' : '0',
          borderRadius: isFullscreen ? '8px' : '0'
        }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
