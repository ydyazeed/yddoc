"use client"

import { useState } from "react"
import { User, LogOut } from "lucide-react"
import { signOut } from "@/actions/auth"

type UserMenuProps = {
  email: string
  name?: string | null
}

export function UserMenu({ email, name }: UserMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        className="flex items-center gap-2 px-3 py-2 border-2 border-[#1A1A2E] rounded-full bg-white text-sm font-semibold text-[#1A1A2E] shadow-[2px_2px_0px_0px_#1A1A2E] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150"
      >
        <User className="w-4 h-4" />
        <span className="max-w-[120px] truncate">{name ?? email}</span>
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 bg-white border-2 border-[#1A1A2E] rounded-xl p-1 shadow-[4px_4px_0px_0px_#1A1A2E] z-50 min-w-[180px]"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="px-3 py-2 text-xs text-[#5A6178] border-b border-[#C9D5F0] mb-1">
            {email}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#1A1A2E] hover:bg-[#E8EEFB] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
