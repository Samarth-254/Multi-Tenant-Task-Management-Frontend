import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Highlighter,
  Palette,
  Link as LinkIcon,
  Heading1,
  Heading2
} from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) return null;

  const colors = [
    { name: 'Red', value: '#ef4444' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Green', value: '#10b981' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Pink', value: '#ec4899' },
  ];

  const highlights = [
    { name: 'Yellow', value: '#fef08a' },
    { name: 'Green', value: '#bbf7d0' },
    { name: 'Blue', value: '#bfdbfe' },
    { name: 'Red', value: '#fecaca' },
    { name: 'Purple', value: '#e9d5ff' },
  ];

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-zinc-800/50 border-b border-zinc-700">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('bold') ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('italic') ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('strike') ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-zinc-700 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('heading', { level: 1 }) ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('heading', { level: 2 }) ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-zinc-700 mx-1"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('bulletList') ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('orderedList') ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-zinc-700 mx-1"></div>

      <div className="relative group">
        <button
          type="button"
          className="p-2 rounded hover:bg-zinc-700 transition-colors text-zinc-400"
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
        </button>
        <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-xl z-10">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetColor().run()}
              className="w-6 h-6 rounded border-2 border-zinc-600 hover:border-white transition-colors bg-white"
              title="Default"
            />
            {colors.map(({ name, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => editor.chain().focus().setColor(value).run()}
                className="w-6 h-6 rounded border-2 border-zinc-600 hover:border-white transition-colors"
                style={{ backgroundColor: value }}
                title={name}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative group">
        <button
          type="button"
          className="p-2 rounded hover:bg-zinc-700 transition-colors text-zinc-400"
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>
        <div className="absolute top-full left-0 mt-1 hidden group-hover:block bg-zinc-800 border border-zinc-700 rounded-lg p-2 shadow-xl z-10">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetHighlight().run()}
              className="w-6 h-6 rounded border-2 border-zinc-600 hover:border-white transition-colors bg-transparent"
              title="No Highlight"
            >
              <span className="text-xs">×</span>
            </button>
            {highlights.map(({ name, value }) => (
              <button
                key={value}
                type="button"
                onClick={() => editor.chain().focus().setHighlight({ color: value }).run()}
                className="w-6 h-6 rounded border-2 border-zinc-600 hover:border-white transition-colors"
                style={{ backgroundColor: value }}
                title={name}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={addLink}
        className={`p-2 rounded hover:bg-zinc-700 transition-colors ${
          editor.isActive('link') ? 'bg-zinc-700 text-white' : 'text-zinc-400'
        }`}
        title="Add Link"
      >
        <LinkIcon className="w-4 h-4" />
      </button>
    </div>
  );
};

const RichTextEditor = ({ value, onChange, placeholder, readOnly = false, className = '' }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      TextStyle,
      Color,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-400 underline hover:text-blue-300',
        },
      }),
    ],
    content: value || '',
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none px-4 py-3 min-h-[120px] max-h-[300px] overflow-y-auto',
      },
    },
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={`border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800 ${className}`}>
      {!readOnly && <MenuBar editor={editor} />}
      <EditorContent editor={editor} />
      
      <style>{`
        .tiptap {
          color: white;
        }
        .tiptap p.is-editor-empty:first-child::before {
          color: #71717a;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .tiptap ul, .tiptap ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .tiptap li {
          margin-bottom: 0.25rem;
        }
        .tiptap h1 {
          font-size: 1.875rem;
          font-weight: bold;
          margin: 1rem 0 0.5rem;
        }
        .tiptap h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin: 0.75rem 0 0.5rem;
        }
        .tiptap a {
          color: #60a5fa;
          text-decoration: underline;
        }
        .tiptap a:hover {
          color: #93c5fd;
        }
        .tiptap strong {
          font-weight: bold;
        }
        .tiptap em {
          font-style: italic;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
