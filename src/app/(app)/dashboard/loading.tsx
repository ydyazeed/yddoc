export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#E8EEFB]">
      {/* Top bar skeleton */}
      <header className="bg-white border-b-2 border-[#1A1A2E] shadow-[0px_4px_0px_0px_#1A1A2E] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="h-8 w-24 bg-[#C9D5F0] rounded-lg animate-pulse" />
          <div className="h-9 w-32 bg-[#C9D5F0] rounded-full animate-pulse" />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-10">
        {[0, 1].map((section) => (
          <section key={section}>
            <div className="flex items-center justify-between mb-6">
              <div className="h-7 w-40 bg-[#C9D5F0] rounded-lg animate-pulse" />
              <div className="h-9 w-36 bg-[#C9D5F0] rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-[#C9D5F0] rounded-xl p-6 shadow-[4px_4px_0px_0px_#C9D5F0] h-36 animate-pulse"
                />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
