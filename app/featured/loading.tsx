export default function FeaturedLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 pt-12 pb-8">
        <div className="h-7 w-48 bg-neutral-100 animate-pulse rounded mb-8" />

        {/* Featured profile cards */}
        <div className="space-y-8">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-5 w-28 bg-neutral-100 animate-pulse rounded" />
                  <div className="h-3 w-40 bg-neutral-100 animate-pulse rounded" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="aspect-[4/3] bg-neutral-100 animate-pulse rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
