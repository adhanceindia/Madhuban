'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useCallback, useState, useRef } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo2,
  Redo2,
  X,
  Check,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type RichTextEditorProps = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

/* ------------------------------------------------------------------ */
/*  Toolbar button                                                     */
/* ------------------------------------------------------------------ */

function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-1.5 rounded-md transition-colors ${
        isActive
          ? 'bg-accent/15 text-accent-deep'
          : 'text-muted-foreground hover:bg-sage-soft hover:text-foreground'
      } ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border/60 mx-1" />
}

/* ------------------------------------------------------------------ */
/*  Link popover                                                       */
/* ------------------------------------------------------------------ */

function LinkPopover({
  editor,
  onClose,
}: {
  editor: Editor
  onClose: () => void
}) {
  const [url, setUrl] = useState(editor.getAttributes('link').href || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function apply() {
    if (!url) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      editor
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url, target: '_blank' })
        .run()
    }
    onClose()
  }

  function remove() {
    editor.chain().focus().extendMarkRange('link').unsetLink().run()
    onClose()
  }

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg shadow-lg p-2 flex items-center gap-2">
      <input
        ref={inputRef}
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') apply()
          if (e.key === 'Escape') onClose()
        }}
        placeholder="https://..."
        className="w-60 px-2 py-1 text-[12px] bg-background border border-border rounded-md focus:outline-none focus:border-accent-deep"
      />
      <button
        type="button"
        onClick={apply}
        title="Apply link"
        className="p-1 rounded-md text-accent hover:bg-accent/10 transition-colors"
      >
        <Check size={14} />
      </button>
      {editor.isActive('link') && (
        <button
          type="button"
          onClick={remove}
          title="Remove link"
          className="p-1 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Toolbar                                                            */
/* ------------------------------------------------------------------ */

function Toolbar({ editor }: { editor: Editor }) {
  const [showLinkPopover, setShowLinkPopover] = useState(false)
  const iconSize = 15

  return (
    <div className="relative flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-border/50 bg-sage-soft/20">
      {/* Inline formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        title="Bold (Ctrl+B)"
      >
        <Bold size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        title="Italic (Ctrl+I)"
      >
        <Italic size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        title="Strikethrough"
      >
        <Strikethrough size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        title="Bullet list"
      >
        <List size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        title="Numbered list"
      >
        <ListOrdered size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        title="Blockquote"
      >
        <Quote size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => setShowLinkPopover(!showLinkPopover)}
        isActive={editor.isActive('link')}
        title="Insert link"
      >
        <LinkIcon size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Alignment */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        isActive={editor.isActive({ textAlign: 'left' })}
        title="Align left"
      >
        <AlignLeft size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        isActive={editor.isActive({ textAlign: 'center' })}
        title="Align center"
      >
        <AlignCenter size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        isActive={editor.isActive({ textAlign: 'right' })}
        title="Align right"
      >
        <AlignRight size={iconSize} />
      </ToolbarButton>

      <ToolbarDivider />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo2 size={iconSize} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo2 size={iconSize} />
      </ToolbarButton>

      {/* Link popover */}
      {showLinkPopover && (
        <LinkPopover editor={editor} onClose={() => setShowLinkPopover(false)} />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Editor                                                             */
/* ------------------------------------------------------------------ */

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const handleUpdate = useCallback(
    ({ editor }: { editor: Editor }) => {
      const html = editor.getHTML()
      // TipTap returns <p></p> for empty content — normalize to empty string
      if (html === '<p></p>') {
        onChange('')
      } else {
        onChange(html)
      }
    },
    [onChange],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Start typing...',
      }),
    ],
    content: value || '',
    onUpdate: handleUpdate,
    editorProps: {
      attributes: {
        class: 'rte-content focus:outline-none min-h-[160px] max-h-[400px] overflow-y-auto px-3 py-3 text-[13px] text-foreground',
      },
    },
  })

  // Sync external value changes (e.g. when content is loaded from API)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && value !== undefined) {
      const isEmpty = !value || value === '<p></p>'
      const editorEmpty = editor.getHTML() === '<p></p>'
      // Only reset if the value meaningfully changed (avoid cursor jump)
      if (isEmpty && editorEmpty) return
      if (value !== editor.getHTML()) {
        editor.commands.setContent(value || '', { emitUpdate: false })
      }
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div className="w-full bg-card border border-border rounded-lg min-h-[200px] animate-pulse" />
    )
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-accent-deep/30 focus-within:border-accent-deep transition-shadow">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />

      {/* Scoped styles for editor content */}
      <style jsx global>{`
        .rte-content h2 {
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.75rem 0 0.25rem;
        }
        .rte-content h3 {
          font-size: 1rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.5rem 0 0.25rem;
        }
        .rte-content p {
          margin: 0.25rem 0;
        }
        .rte-content ul {
          list-style: disc;
          padding-left: 1.25rem;
          margin: 0.25rem 0;
        }
        .rte-content ol {
          list-style: decimal;
          padding-left: 1.25rem;
          margin: 0.25rem 0;
        }
        .rte-content li {
          margin: 0.125rem 0;
        }
        .rte-content blockquote {
          border-left: 3px solid var(--accent, #2e7d32);
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          font-style: italic;
          color: var(--muted-foreground, #666);
        }
        .rte-content a {
          color: var(--accent, #2e7d32);
          text-decoration: underline;
          cursor: pointer;
        }
        .rte-content a:hover {
          color: var(--accent-deep, #1b5e20);
        }
        .rte-content s {
          text-decoration: line-through;
        }
        /* Placeholder */
        .tiptap p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--muted-foreground, #999);
          opacity: 0.5;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  )
}
