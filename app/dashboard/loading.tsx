export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#EEF2F7]">
      {/* Header skeleton */}
      <div className="mx-auto max-w-2xl px-4 pt-6 sm:pt-10 pb-4 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-[50px] w-[150px] bg-neutral-200/60 rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200/60" />
            <div className="space-y-1.5">
              <div className="h-3.5 w-24 bg-neutral-200/60 rounded" />
              <div className="h-2.5 w-32 bg-neutral-100 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="mx-auto max-w-2xl px-4 pb-16 animate-pulse">
        <div className="space-y-6">
          {/* Add Product button */}
          <div className="flex justify-center">
            <div className="w-[60%] h-[48px] bg-neutral-200/60 rounded-lg" />
          </div>
          {/* Product rows */}
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-gray-200">
              <div className="h-10 w-10 rounded bg-neutral-200/80 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/5 bg-neutral-200/80 rounded" />
                <div className="h-3 w-3/5 bg-neutral-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
