"use client"

import type { Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ToolbarButtonProps = {
  onClick: () => void
  isActive: boolean
  label: string
  children: React.ReactNode
  disabled?: boolean
}

function ToolbarButton({
  onClick,
  isActive,
  label,
  children,
  disabled,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      aria-label={label}
      aria-pressed={isActive}
      disabled={disabled}
      className={cn(
        "p-2 rounded-lg border-2 transition-all duration-150",
        isActive
          ? "bg-[#3B5BDB] text-white border-[#3B5BDB]"
          : "bg-transparent text-[#1A1A2E] border-transparent hover:bg-[#C9D5F0]/50 hover:border-[#C9D5F0]",
        "disabled:opacity-40 disabled:cursor-not-allowed"
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-6 bg-[#C9D5F0] mx-1" aria-hidden="true" />
}

type ToolbarProps = {
  editor: Editor
  disabled?: boolean
}

export function Toolbar({ editor, disabled }: ToolbarProps) {
  return (
    <div
      className="bg-white border-2 border-[#1A1A2E] rounded-xl p-2 shadow-[4px_4px_0px_0px_#1A1A2E] flex items-center gap-1 flex-wrap"
      role="toolbar"
      aria-label="Text formatting"
    >
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        label="Bold"
        disabled={disabled}
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        label="Italic"
        disabled={disabled}
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        label="Underline"
        disabled={disabled}
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive("heading", { level: 1 })}
        label="Heading 1"
        disabled={disabled}
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive("heading", { level: 2 })}
        label="Heading 2"
        disabled={disabled}
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive("heading", { level: 3 })}
        label="Heading 3"
        disabled={disabled}
      >
        <Heading3 className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive("bulletList")}
        label="Bullet list"
        disabled={disabled}
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive("orderedList")}
        label="Ordered list"
        disabled={disabled}
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}
