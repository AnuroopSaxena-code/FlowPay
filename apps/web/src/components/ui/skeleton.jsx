import { cn } from "@/lib/utils"

function Skeleton({
  className,
  children,
  loading = true,
  ...props
}) {
  if (!loading) return children;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-slate-800/40 animate-pulse",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent",
        className
      )}
      {...props}
    >
      {/* Invisible children to maintain layout size if provided */}
      {children && (
        <div className="opacity-0 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  );
}

export { Skeleton }
