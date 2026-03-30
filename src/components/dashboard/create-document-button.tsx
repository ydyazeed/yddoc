"use client"

import { useTransition } from "react"
import { Plus } from "lucide-react"
import { createDocument } from "@/actions/documents"
import { cn } from "@/lib/utils"

export function CreateDocumentButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => createDocument())}
      disabled={isPending}
      aria-label="Create new document"
      className={cn(
        "flex items-center gap-2 bg-[#3B5BDB] text-white border-2 border-[#1A1A2E] rounded-full px-5 py-2 text-sm font-semibold",
        "shadow-[4px_4px_0px_0px_#1A1A2E] transition-all duration-150",
        "hover:shadow-[2px_2px_0px_0px_#1A1A2E] hover:translate-x-[1px] hover:translate-y-[1px]",
        "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
        "disabled:opacity-60 disabled:cursor-not-allowed"
      )}
    >
      <Plus className="w-4 h-4" />
      {isPending ? "Creating..." : "New Document"}
    </button>
  )
}
