import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { TextStyleKit } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Image from '@tiptap/extension-image';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Palette,
  Eraser,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Unlink,
  ImagePlus,
  Undo2,
  Redo2,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  SeparatorHorizontal,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return (tmp.textContent || tmp.innerText || '').replace(/\u00a0/g, ' ').trim();
};

export const sanitizeHtml = (html: string): string => {
  return (html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<(iframe|object|embed|form|link|meta|base|input|button|textarea|caption|select|option)[\s\S]*?>/gi, '')
    .replace(/\s+on\w+=("[^"]*"|'[^']*'|\S+)/gi, '')
    .replace(/javascript:/gi, '')
    .trim();
};

const TEXT_COLORS = ['#111111', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
const HILITE_COLORS = ['#fef08a', '#f59e0b', '#111111', '#ef4444', '#22c55e', '#3b82f6', '#ec4899', '#ffffff'];

const RAINBOW = 'bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]';

const iconBtn = (active: boolean) =>
  `inline-flex h-7 w-7 items-center justify-center rounded-md transition-colors cursor-pointer ${
    active
      ? 'bg-primary text-primary-foreground shadow-sm'
      : 'text-foreground/70 hover:bg-primary/10 hover:text-primary'
  }`;

const dotBtn =
  'inline-flex h-6 w-6 items-center justify-center rounded-md border border-border cursor-pointer hover:scale-110 transition-transform';

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder = '', minHeight = 90 }) => {
  const [showTextColor, setShowTextColor] = useState(false);
  const [showHighlight, setShowHighlight] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      Placeholder.configure({ placeholder }),
      TextStyleKit.configure({}),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'rte-content px-3 py-2 text-sm leading-relaxed focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(sanitizeHtml(editor.getHTML())),
  });

  // Keep the editor in sync when the parent value changes (language tab switch, edit product, etc.)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const prevent = (e: React.MouseEvent) => e.preventDefault();

  const setLink = () => {
    const url = window.prompt('Enter link URL (https://...)');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const setImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b border-border bg-muted/40">
        <button type="button" className={iconBtn(editor.isActive('bold'))} title="Bold" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('italic'))} title="Italic" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('underline'))} title="Underline" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <Underline size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('strike'))} title="Strikethrough" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={15} />
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={iconBtn(editor.isActive('heading', { level: 1 }))} title="Heading 1" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          <Heading1 size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('heading', { level: 2 }))} title="Heading 2" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('heading', { level: 3 }))} title="Heading 3" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('paragraph'))} title="Normal text" onMouseDown={prevent} onClick={() => editor.chain().focus().setParagraph().run()}>
          <Pilcrow size={15} />
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={`${iconBtn(false)} text-[10px] font-bold`} title="Small font size" onMouseDown={prevent} onClick={() => editor.chain().focus().setFontSize('0.875rem').run()}>
          S
        </button>
        <button type="button" className={`${iconBtn(false)} text-xs font-bold`} title="Normal font size" onMouseDown={prevent} onClick={() => editor.chain().focus().setFontSize('1rem').run()}>
          M
        </button>
        <button type="button" className={`${iconBtn(false)} text-sm font-bold`} title="Large font size" onMouseDown={prevent} onClick={() => editor.chain().focus().setFontSize('1.25rem').run()}>
          L
        </button>
        <button type="button" className={`${iconBtn(false)} text-base font-bold`} title="Extra large font size" onMouseDown={prevent} onClick={() => editor.chain().focus().setFontSize('1.5rem').run()}>
          XL
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={iconBtn(editor.isActive({ textAlign: 'left' }))} title="Align left" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <AlignLeft size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive({ textAlign: 'center' }))} title="Align center" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <AlignCenter size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive({ textAlign: 'right' }))} title="Align right" onMouseDown={prevent} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <AlignRight size={15} />
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={iconBtn(editor.isActive('bulletList'))} title="Bullet list" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('orderedList'))} title="Numbered list" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('blockquote'))} title="Quote" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={15} />
        </button>
        <button type="button" className={iconBtn(editor.isActive('code'))} title="Inline code" onMouseDown={prevent} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={15} />
        </button>
        <button type="button" className={iconBtn(showTextColor)} title="Text color" onMouseDown={prevent} onClick={() => { setShowTextColor(s => !s); setShowHighlight(false); }}>
          <Palette size={15} />
        </button>
        <button type="button" className={iconBtn(showHighlight)} title="Highlight" onMouseDown={prevent} onClick={() => { setShowHighlight(s => !s); setShowTextColor(false); }}>
          <Highlighter size={15} />
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={iconBtn(false)} title="Link" onMouseDown={prevent} onClick={setLink}>
          <Link2 size={15} />
        </button>
        <button type="button" className={iconBtn(false)} title="Remove link" onMouseDown={prevent} onClick={() => editor.chain().focus().unsetLink().run()}>
          <Unlink size={15} />
        </button>
        <button type="button" className={iconBtn(false)} title="Insert image" onMouseDown={prevent} onClick={setImage}>
          <ImagePlus size={15} />
        </button>
        <button type="button" className={iconBtn(false)} title="Horizontal line" onMouseDown={prevent} onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          <SeparatorHorizontal size={15} />
        </button>

        <span className="w-px h-5 bg-border mx-1" />

        <button type="button" className={iconBtn(false)} title="Clear formatting" onMouseDown={prevent} onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}>
          <Eraser size={15} />
        </button>
        <button type="button" className={iconBtn(false)} title="Undo" onMouseDown={prevent} onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 size={15} />
        </button>
        <button type="button" className={iconBtn(false)} title="Redo" onMouseDown={prevent} onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 size={15} />
        </button>
      </div>

      {/* Text color palette */}
      {showTextColor && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border bg-background animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[10px] font-bold uppercase text-muted-foreground mr-1">Color</span>
          {TEXT_COLORS.map((c) => (
            <span
              key={c}
              className={dotBtn}
              style={{ backgroundColor: c }}
              title={`Text color ${c}`}
              onMouseDown={prevent}
              onClick={() => { editor.chain().focus().setColor(c).run(); setShowTextColor(false); }}
            />
          ))}
          <label className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border cursor-pointer hover:scale-110 transition-transform" title="Custom color">
            <span className={`h-4 w-4 rounded-sm border border-border ${RAINBOW}`} />
            <input
              type="color"
              className="hidden"
              onChange={(e) => { editor.chain().focus().setColor(e.target.value).run(); setShowTextColor(false); }}
            />
          </label>
          <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-foreground/70 hover:bg-primary/10 hover:text-primary cursor-pointer ml-1" title="Reset color" onMouseDown={prevent} onClick={() => { editor.chain().focus().unsetColor().run(); setShowTextColor(false); }}>
            <Eraser size={13} />
          </button>
        </div>
      )}

      {/* Highlight palette */}
      {showHighlight && (
        <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border bg-background animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-[10px] font-bold uppercase text-muted-foreground mr-1">Highlight</span>
          {HILITE_COLORS.map((c) => (
            <span
              key={c}
              className={dotBtn}
              style={{ backgroundColor: c }}
              title={`Highlight ${c}`}
              onMouseDown={prevent}
              onClick={() => { editor.chain().focus().setHighlight({ color: c }).run(); setShowHighlight(false); }}
            />
          ))}
          <label className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-border cursor-pointer hover:scale-110 transition-transform" title="Custom highlight color">
            <span className={`h-4 w-4 rounded-sm border border-border ${RAINBOW}`} />
            <input
              type="color"
              className="hidden"
              onChange={(e) => { editor.chain().focus().setHighlight({ color: e.target.value }).run(); setShowHighlight(false); }}
            />
          </label>
          <button type="button" className="inline-flex h-6 w-6 items-center justify-center rounded-md text-foreground/70 hover:bg-primary/10 hover:text-primary cursor-pointer ml-1" title="Remove highlight" onMouseDown={prevent} onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlight(false); }}>
            <Eraser size={13} />
          </button>
        </div>
      )}

      <EditorContent editor={editor} className="rte" style={{ minHeight }} />

      <style>{`
        .rte-content p { margin: 0; }
        .rte-content:focus { outline: none; }
        .rte-content ul { list-style: disc; padding-left: 1.5rem; margin: 0.25rem 0; }
        .rte-content ol { list-style: decimal; padding-left: 1.5rem; margin: 0.25rem 0; }
        .rte-content blockquote { border-left: 3px solid var(--color-border, #e2e8f0); padding-left: 0.75rem; color: var(--color-muted-foreground, #64748b); }
        .rte-content a { color: var(--color-primary, #2563eb); text-decoration: underline; }
        .rte-content code { background: rgb(0 0 0 / 0.06); border-radius: 4px; padding: 0.1rem 0.3rem; font-size: 0.85em; }
        .rte-content h1 { font-size: 1.75rem; font-weight: 700; }
        .rte-content h2 { font-size: 1.4rem; font-weight: 700; }
        .rte-content h3 { font-size: 1.15rem; font-weight: 700; }
        .rte-content p.is-editor-empty:first-child::before {
          color: rgba(100, 116, 139, 0.6);
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .rte-content img { max-width: 100%; border-radius: 8px; }
        .rte-content hr { border: 0; border-top: 1px solid var(--color-border, #e2e8f0); margin: 0.5rem 0; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;