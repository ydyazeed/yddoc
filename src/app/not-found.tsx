import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#E8EEFB] flex items-center justify-center p-4">
      <div className="bg-white border-2 border-[#1A1A2E] rounded-xl p-10 shadow-[4px_4px_0px_0px_#1A1A2E] text-center max-w-sm w-full">
        <h1 className="text-6xl font-bold text-[#3B5BDB] mb-2">404</h1>
        <h2 className="text-xl font-bold text-[#1A1A2E] mb-2">
          Page not found
        </h2>
        <p className="text-sm text-[#5A6178] mb-8">
          This page or document doesn&apos;t exist or the link may have expired.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center bg-[#3B5BDB] text-white border-2 border-[#1A1A2E] rounded-full px-6 py-2.5 text-sm font-semibold shadow-[4px_4px_0px_0px_#1A1A2E] hover:shadow-[2px_2px_0px_0px_#1A1A2E] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
