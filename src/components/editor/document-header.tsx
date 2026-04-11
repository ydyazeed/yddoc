"use client"

import { useState, useTransition, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, Printer } from "lucide-react"
import { updateDocument } from "@/actions/documents"
import { useAutoSave } from "@/hooks/use-auto-save"
import { SaveIndicator } from "./save-indicator"
import { cn } from "@/lib/utils"

type DocumentHeaderProps = {
  documentId: string
  initialTitle: string
  isOwner: boolean
  shareButton?: React.ReactNode
}

export function DocumentHeader({
  documentId,
  initialTitle,
  isOwner,
  shareButton,
}: DocumentHeaderProps) {
  const [title, setTitle] = useState(initialTitle)

  const handleTitleSave = async (value: unknown) => {
    await updateDocument(documentId, { title: value as string })
  }

  const { status, save } = useAutoSave({
    onSave: handleTitleSave,
    debounceMs: 1000,
  })

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value)
    save(e.target.value)
  }

  return (
    <header className="bg-white border-b-2 border-[#1A1A2E] shadow-[0px_4px_0px_0px_#1A1A2E] px-6 py-3 sticky top-0 z-20">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        {/* Back */}
        <Link
          href="/dashboard"
          aria-label="Back to dashboard"
          className="p-2 rounded-lg border-2 border-transparent hover:bg-[#C9D5F0]/50 hover:border-[#C9D5F0] transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-[#1A1A2E]" />
        </Link>

        {/* Title */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          {isOwner ? (
            <input
              value={title}
              onChange={handleTitleChange}
              className="flex-1 text-lg font-bold text-[#1A1A2E] bg-transparent border-none outline-none focus:bg-white focus:border-2 focus:border-[#3B5BDB] focus:rounded-lg focus:px-2 focus:-mx-2 transition-all truncate"
              aria-label="Document title"
            />
          ) : (
            <h1 className="flex-1 text-lg font-bold text-[#1A1A2E] truncate">
              {title}
            </h1>
          )}
          {isOwner && <SaveIndicator status={status} />}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print document"
            className="flex items-center gap-2 bg-white border-2 border-[#1A1A2E] rounded-full px-4 py-1.5 text-sm font-semibold text-[#1A1A2E] shadow-[4px_4px_0px_0px_#1A1A2E] transition-all duration-150 hover:shadow-[2px_2px_0px_0px_#1A1A2E] hover:translate-x-[1px] hover:translate-y-[1px] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
          {isOwner && shareButton}
        </div>
      </div>
    </header>
  )
}
