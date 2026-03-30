"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Placeholder from "@tiptap/extension-placeholder"
import { useCallback } from "react"
import { updateDocument } from "@/actions/documents"
import { useAutoSave } from "@/hooks/use-auto-save"
import { Toolbar } from "./toolbar"
import { SaveIndicator } from "./save-indicator"
import type { Prisma } from "@prisma/client"

// Placeholder is part of @tiptap/extension-placeholder — install separately
// Using StarterKit's built-in placeholder support via CSS instead

type TiptapEditorProps = {
  documentId: string
  initialContent: Prisma.JsonValue
  editable?: boolean
  shareToken?: string
}

export function TiptapEditor({
  documentId,
  initialContent,
  editable = true,
  shareToken,
}: TiptapEditorProps) {
  const handleSave = useCallback(
    async (content: unknown) => {
      await updateDocument(documentId, { content: content as Prisma.InputJsonValue }, shareToken)
    },
    [documentId, shareToken]
  )

  const { status, save } = useAutoSave({ onSave: handleSave })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Placeholder.configure({ placeholder: "Start writing..." }),
    ],
    immediatelyRender: false,
    content: (initialContent as object) ?? {},
    editable,
    onUpdate: ({ editor }) => {
      if (editable) {
        save(editor.getJSON())
      }
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[calc(100vh-280px)] text-[#1A1A2E]",
      },
    },
  })

  if (!editor) return null

  return (
    <div className="flex flex-col gap-4">
      {editable && (
        <div className="flex items-center gap-4 sticky top-[73px] z-10">
          <Toolbar editor={editor} />
          <SaveIndicator status={status} />
        </div>
      )}

      <div className="bg-white border-2 border-[#1A1A2E] rounded-xl p-8 shadow-[4px_4px_0px_0px_#1A1A2E]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
