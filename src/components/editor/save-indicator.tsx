"use client"

import { cn } from "@/lib/utils"
import type { SaveStatus } from "@/hooks/use-auto-save"

type SaveIndicatorProps = {
  status: SaveStatus
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") return null

  return (
    <span
      aria-live="polite"
      className={cn(
        "text-xs font-medium transition-opacity duration-300",
        status === "saving" && "text-[#5A6178] opacity-100",
        status === "saved" && "text-[#5A6178] opacity-100",
        status === "error" && "text-[#E03131] opacity-100"
      )}
    >
      {status === "saving" && "Saving..."}
      {status === "saved" && "Saved"}
      {status === "error" && "Save failed"}
    </span>
  )
}
