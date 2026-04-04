export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-7 w-40 bg-neutral-100 animate-pulse rounded" />
          <div className="h-9 w-24 bg-neutral-100 animate-pulse rounded" />
        </div>

        {/* Content area */}
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-neutral-100 rounded-xl p-4 space-y-4">
              <div className="h-5 w-32 bg-neutral-100 animate-pulse rounded" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="aspect-[4/3] bg-neutral-100 animate-pulse rounded-lg" />
                    <div className="h-4 w-3/4 bg-neutral-100 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
