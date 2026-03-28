import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

const PageSkeleton = () => (
  <div className="space-y-4 animate-fade-in">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-3.5 w-80" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </div>

    {/* KPI bar skeleton */}
    <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 rounded-lg" />
      ))}
    </div>

    {/* Loading indicator */}
    <div className="flex items-center justify-center gap-2 py-3">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Carregando módulo...</span>
    </div>

    {/* Table skeleton */}
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="border-b border-border px-3 py-2">
        <div className="grid grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-full" />
          ))}
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b border-border px-3 py-2.5">
          <div className="grid grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, j) => (
              <Skeleton key={j} className="h-3 w-full" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default PageSkeleton;
