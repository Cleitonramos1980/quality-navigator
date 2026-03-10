import { Skeleton } from "@/components/ui/skeleton";

const PageSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="h-4 w-96" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
      <Skeleton className="h-24 rounded-lg" />
    </div>
    <Skeleton className="h-[420px] rounded-lg" />
  </div>
);

export default PageSkeleton;
