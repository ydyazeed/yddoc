import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useAutoSave } from "@/hooks/use-auto-save"

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("starts with idle status", () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave({ onSave, debounceMs: 1000 }))
    expect(result.current.status).toBe("idle")
  })

  it("sets status to saving immediately on save call", () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave({ onSave, debounceMs: 1000 }))

    act(() => {
      result.current.save("some content")
    })

    expect(result.current.status).toBe("saving")
  })

  it("calls onSave after debounce delay", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave({ onSave, debounceMs: 1000 }))

    act(() => {
      result.current.save("hello")
    })

    expect(onSave).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(onSave).toHaveBeenCalledWith("hello")
  })

  it("sets status to saved after successful save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave({ onSave, debounceMs: 1000 }))

    act(() => {
      result.current.save("hello")
    })

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.status).toBe("saved")
  })

  it("sets status to error when save fails", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("Network error"))
    const { result } = renderHook(() => useAutoSave({ onSave, debounceMs: 1000 }))

    act(() => {
      result.current.save("hello")
    })

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.status).toBe("error")
  })

  it("debounces rapid saves — only calls onSave once", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => useAutoSave({ onSave, debounceMs: 1000 }))

    act(() => {
      result.current.save("a")
      result.current.save("ab")
      result.current.save("abc")
    })

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(onSave).toHaveBeenCalledOnce()
    expect(onSave).toHaveBeenCalledWith("abc")
  })

  it("returns to idle after fade delay", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() =>
      useAutoSave({ onSave, debounceMs: 1000, fadeMs: 500 })
    )

    act(() => {
      result.current.save("hello")
    })

    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.status).toBe("saved")

    await act(async () => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current.status).toBe("idle")
  })
})
