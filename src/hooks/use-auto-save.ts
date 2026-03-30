import { useCallback, useEffect, useRef, useState } from "react"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

type UseAutoSaveOptions = {
  onSave: (value: unknown) => Promise<void>
  debounceMs?: number
  fadeMs?: number
}

export function useAutoSave({
  onSave,
  debounceMs = 2500,
  fadeMs = 2000,
}: UseAutoSaveOptions) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestValueRef = useRef<unknown>(null)

  const save = useCallback(
    (value: unknown) => {
      latestValueRef.current = value
      setStatus("saving")

      if (timerRef.current) clearTimeout(timerRef.current)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)

      timerRef.current = setTimeout(async () => {
        try {
          await onSave(latestValueRef.current)
          setStatus("saved")
          fadeTimerRef.current = setTimeout(() => setStatus("idle"), fadeMs)
        } catch {
          setStatus("error")
        }
      }, debounceMs)
    },
    [onSave, debounceMs, fadeMs]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current)
    }
  }, [])

  return { status, save }
}
