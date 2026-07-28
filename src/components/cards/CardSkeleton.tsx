export function CardSkeleton() {
  return (
    <div className="w-full h-full bg-white flex flex-col p-5 space-y-4 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="skeleton h-3 w-16 rounded-full" />
        <div className="skeleton h-3 w-2 rounded-full" />
        <div className="skeleton h-3 w-24 rounded-full" />
        <div className="ml-auto skeleton h-5 w-16 rounded-full" />
      </div>

      {/* Title */}
      <div className="space-y-2">
        <div className="skeleton h-6 w-4/5 rounded-lg" />
        <div className="skeleton h-4 w-3/5 rounded-lg" />
      </div>

      {/* Confidence bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between">
          <div className="skeleton h-3 w-24 rounded-full" />
          <div className="skeleton h-3 w-16 rounded-full" />
        </div>
        <div className="skeleton h-1 w-full rounded-full" />
      </div>

      {/* Tabs */}
      <div className="skeleton h-10 w-full rounded-xl" />

      {/* Content lines */}
      <div className="space-y-2.5 flex-1">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-11/12 rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <div className="skeleton h-10 flex-1 rounded-xl" />
        <div className="skeleton h-10 flex-1 rounded-xl" />
        <div className="skeleton h-10 w-10 rounded-xl" />
        <div className="skeleton h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
}
