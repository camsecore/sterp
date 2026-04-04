export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 pt-12 pb-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-neutral-100 animate-pulse mb-4" />
          <div className="h-5 w-32 bg-neutral-100 animate-pulse rounded mb-2" />
          <div className="h-4 w-48 bg-neutral-100 animate-pulse rounded" />
        </div>

        {/* Tab bar */}
        <div className="flex gap-4 mb-8 justify-center">
          <div className="h-8 w-20 bg-neutral-100 animate-pulse rounded" />
          <div className="h-8 w-24 bg-neutral-100 animate-pulse rounded" />
          <div className="h-8 w-20 bg-neutral-100 animate-pulse rounded" />
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[4/3] bg-neutral-100 animate-pulse rounded-lg" />
              <div className="h-4 w-3/4 bg-neutral-100 animate-pulse rounded" />
              <div className="h-3 w-1/2 bg-neutral-100 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
