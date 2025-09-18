import { Skeleton } from "@/components/ui/skeleton"

export function SchedulerSkeleton() {
  return (
    <div className="space-y-4">
      {/* Table skeleton */}
      <div className="rounded-md border">
        {/* Header row */}
        <div className="bg-muted/50 p-4 border-b">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-1/8" />
            <Skeleton className="h-4 w-3/8" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 flex-1" />
          </div>
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="p-4 border-b last:border-b-0">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-1/8" />
              <Skeleton className="h-4 w-3/8" />
              <Skeleton className="h-6 flex-1" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 flex-1" />
            </div>
          </div>
        ))}
      </div>
      {/* Pagination skeleton */}
      <div className="flex items-center justify-between px-4 py-4">
        <div />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}