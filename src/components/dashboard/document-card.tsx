"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { FileText, Trash2, MoreVertical } from "lucide-react"
import { deleteDocument } from "@/actions/documents"
import { cn } from "@/lib/utils"

type DocumentCardProps = {
  doc: {
    id: string
    title: string
    updatedAt: Date
    owner: { name: string | null; email: string }
  }
  isOwner?: boolean
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export function DocumentCard({ doc, isOwner = false }: DocumentCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      await deleteDocument(doc.id)
    })
  }

  return (
    <div
      className={cn(
        "relative bg-white border-2 border-[#1A1A2E] rounded-xl p-6",
        "shadow-[4px_4px_0px_0px_#1A1A2E] transition-all duration-150",
        "hover:shadow-[6px_6px_0px_0px_#1A1A2E] hover:-translate-x-[1px] hover:-translate-y-[1px]"
      )}
    >
      <Link href={`/documents/${doc.id}`} className="block group">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-[#E8EEFB] border-2 border-[#1A1A2E] rounded-lg">
            <FileText className="w-5 h-5 text-[#3B5BDB]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-[#1A1A2E] truncate group-hover:text-[#3B5BDB] transition-colors">
              {doc.title}
            </h3>
            <p className="text-xs text-[#5A6178] mt-0.5">
              {doc.owner.name ?? doc.owner.email}
            </p>
          </div>
        </div>
        <p className="text-xs text-[#5A6178]">
          Edited {timeAgo(doc.updatedAt)}
        </p>
      </Link>

      {isOwner && (
        <div className="absolute top-4 right-4">
          <button
            aria-label="Document options"
            onClick={(e) => {
              e.preventDefault()
              setShowMenu(!showMenu)
            }}
            className="p-1 rounded-lg hover:bg-[#C9D5F0] transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-[#5A6178]" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-8 bg-white border-2 border-[#1A1A2E] rounded-xl p-1 shadow-[4px_4px_0px_0px_#1A1A2E] z-10 min-w-[120px]"
              onMouseLeave={() => setShowMenu(false)}
            >
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowConfirm(true)
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#E03131] hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border-2 border-[#1A1A2E] rounded-xl p-6 shadow-[4px_4px_0px_0px_#1A1A2E] max-w-sm w-full mx-4">
            <h3 className="font-bold text-[#1A1A2E] mb-2">Delete document?</h3>
            <p className="text-sm text-[#5A6178] mb-6">
              &ldquo;{doc.title}&rdquo; will be permanently deleted.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm font-semibold border-2 border-[#1A1A2E] rounded-full bg-white text-[#1A1A2E] shadow-[2px_2px_0px_0px_#1A1A2E] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="px-4 py-2 text-sm font-semibold border-2 border-[#1A1A2E] rounded-full bg-[#E03131] text-white shadow-[2px_2px_0px_0px_#1A1A2E] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
