"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { signIn } from "@/actions/auth"
import { cn } from "@/lib/utils"

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="w-full max-w-md bg-white border-2 border-[#1A1A2E] rounded-xl p-8 shadow-[4px_4px_0px_0px_#1A1A2E]">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1A1A2E] tracking-tight">
          YDDoc
        </h1>
        <p className="mt-1 text-sm text-[#5A6178]">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#1A1A2E]"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full bg-white border-2 border-[#1A1A2E] rounded-xl px-4 py-2 text-[#1A1A2E] shadow-[2px_2px_0px_0px_#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:ring-offset-2 transition-all"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#1A1A2E]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full bg-white border-2 border-[#1A1A2E] rounded-xl px-4 py-2 text-[#1A1A2E] shadow-[2px_2px_0px_0px_#1A1A2E] focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] focus:ring-offset-2 transition-all"
          />
        </div>

        {error && (
          <p className="text-sm text-[#E03131] font-medium">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full bg-[#3B5BDB] text-white border-2 border-[#1A1A2E] rounded-full px-6 py-2.5 text-sm font-semibold",
            "shadow-[4px_4px_0px_0px_#1A1A2E] transition-all duration-150",
            "hover:shadow-[2px_2px_0px_0px_#1A1A2E] hover:translate-x-[1px] hover:translate-y-[1px]",
            "active:shadow-none active:translate-x-[2px] active:translate-y-[2px]",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-[4px_4px_0px_0px_#1A1A2E] disabled:translate-x-0 disabled:translate-y-0"
          )}
        >
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#5A6178]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-semibold text-[#3B5BDB] hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  )
}
