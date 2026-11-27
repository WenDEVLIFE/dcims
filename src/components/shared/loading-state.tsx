import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  rows?: number;
  className?: string;
}

export function LoadingState({ rows = 5, className }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      className={cn("flex flex-col gap-2", className)}
    >
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton
          key={index}
          className="h-9 w-full rounded-md motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}
