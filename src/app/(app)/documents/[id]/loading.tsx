export default function DocumentLoading() {
  return (
    <div className="min-h-screen bg-[#E8EEFB]">
      {/* Header skeleton */}
      <header className="bg-white border-b-2 border-[#1A1A2E] shadow-[0px_4px_0px_0px_#1A1A2E] px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="h-9 w-9 bg-[#C9D5F0] rounded-lg animate-pulse" />
          <div className="flex-1 h-7 bg-[#C9D5F0] rounded-lg animate-pulse" />
          <div className="h-9 w-20 bg-[#C9D5F0] rounded-full animate-pulse" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-6">
        {/* Toolbar skeleton */}
        <div className="bg-white border-2 border-[#C9D5F0] rounded-xl p-2 mb-4 shadow-[4px_4px_0px_0px_#C9D5F0] h-12 animate-pulse" />
        {/* Editor skeleton */}
        <div className="bg-white border-2 border-[#C9D5F0] rounded-xl p-8 shadow-[4px_4px_0px_0px_#C9D5F0] min-h-[60vh] animate-pulse" />
      </main>
    </div>
  )
}
