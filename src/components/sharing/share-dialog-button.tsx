"use client"

import { useState, useEffect, useTransition } from "react"
import { Share2, Copy, Trash2, X, Link as LinkIcon } from "lucide-react"
import { toast } from "sonner"
import {
  createShareLink,
  getShareLinks,
  deleteShareLink,
} from "@/actions/shares"
import { cn } from "@/lib/utils"
import type { DocumentShare } from "@prisma/client"

type ShareDialogButtonProps = {
  documentId: string
}

export function ShareDialogButton({ documentId }: ShareDialogButtonProps) {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<DocumentShare[]>([])
  const [role, setRole] = useState<"VIEWER" | "EDITOR">("VIEWER")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const data = await getShareLinks(documentId)
        setLinks(data)
      })
    }
  }, [open, documentId])

  function handleCreate() {
    startTransition(async () => {
      const share = await createShareLink(documentId, role)
      setLinks((prev) => [share, ...prev])
    })
  }

  function handleDelete(shareId: string) {
    startTransition(async () => {
      await deleteShareLink(shareId)
      setLinks((prev) => prev.filter((l) => l.id !== shareId))
    })
  }

  function handleCopy(token: string) {
    const url = `${window.location.origin}/shared/${token}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard!")
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Share document"
        className={cn(
          "flex items-center gap-2 bg-[#3B5BDB] text-white border-2 border-[#1A1A2E] rounded-full px-4 py-1.5 text-sm font-semibold",
          "shadow-[4px_4px_0px_0px_#1A1A2E] transition-all duration-150",
          "hover:shadow-[2px_2px_0px_0px_#1A1A2E] hover:translate-x-[1px] hover:translate-y-[1px]",
          "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
        )}
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border-2 border-[#1A1A2E] rounded-xl p-6 shadow-[4px_4px_0px_0px_#1A1A2E] w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#1A1A2E]">
                Share Document
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close share dialog"
                className="p-1 rounded-lg hover:bg-[#C9D5F0] transition-colors"
              >
                <X className="w-5 h-5 text-[#5A6178]" />
              </button>
            </div>

            {/* Create link */}
            <div className="flex items-center gap-2 mb-6">
              <select
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "VIEWER" | "EDITOR")
                }
                aria-label="Share role"
                className="flex-1 bg-white border-2 border-[#1A1A2E] rounded-xl px-3 py-2 text-sm font-medium text-[#1A1A2E] shadow-[2px_2px_0px_0px_#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:ring-offset-2"
              >
                <option value="VIEWER">Viewer (read-only)</option>
                <option value="EDITOR">Editor (can edit)</option>
              </select>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className={cn(
                  "flex items-center gap-2 bg-[#3B5BDB] text-white border-2 border-[#1A1A2E] rounded-full px-4 py-2 text-sm font-semibold",
                  "shadow-[4px_4px_0px_0px_#1A1A2E] transition-all duration-150",
                  "hover:shadow-[2px_2px_0px_0px_#1A1A2E] hover:translate-x-[1px] hover:translate-y-[1px]",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <LinkIcon className="w-4 h-4" />
                Create link
              </button>
            </div>

            {/* Links list */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {links.length === 0 && !isPending && (
                <p className="text-sm text-[#5A6178] text-center py-4">
                  No share links yet. Create one above.
                </p>
              )}
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-3 bg-[#E8EEFB] border-2 border-[#C9D5F0] rounded-xl px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs font-semibold px-2 py-0.5 rounded-full border-2 border-[#1A1A2E]",
                          link.role === "EDITOR"
                            ? "bg-[#3B5BDB] text-white"
                            : "bg-[#C9D5F0] text-[#1A1A2E]"
                        )}
                      >
                        {link.role}
                      </span>
                      <span className="text-xs text-[#5A6178] truncate font-mono">
                        ...{link.shareToken.slice(-8)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5A6178] mt-0.5">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(link.shareToken)}
                    aria-label="Copy share link"
                    className="p-1.5 rounded-lg hover:bg-[#C9D5F0] transition-colors"
                  >
                    <Copy className="w-4 h-4 text-[#5A6178]" />
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    disabled={isPending}
                    aria-label="Delete share link"
                    className="p-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-[#E03131]" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
