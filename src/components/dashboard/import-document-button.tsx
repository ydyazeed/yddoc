"use client"

import { useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ImportDocumentButton() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    startTransition(async () => {
      try {
        const res = await fetch("/api/import", {
          method: "POST",
          body: formData,
        })

        if (!res.ok) {
          const { error } = await res.json()
          toast.error(error ?? "Import failed")
          return
        }

        const { documentId } = await res.json()
        router.push(`/documents/${documentId}`)
      } catch {
        toast.error("Import failed. Please try again.")
      }
    })

    // Reset so same file can be re-imported
    e.target.value = ""
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.docx"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Import document file"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isPending}
        aria-label="Import document"
        className={cn(
          "flex items-center gap-2 bg-white text-[#1A1A2E] border-2 border-[#1A1A2E] rounded-full px-5 py-2 text-sm font-semibold",
          "shadow-[4px_4px_0px_0px_#1A1A2E] transition-all duration-150",
          "hover:shadow-[2px_2px_0px_0px_#1A1A2E] hover:translate-x-[1px] hover:translate-y-[1px]",
          "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
          "disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        <Upload className="w-4 h-4" />
        {isPending ? "Importing..." : "Import"}
      </button>
    </>
  )
}
