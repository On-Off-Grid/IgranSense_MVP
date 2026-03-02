/**
 * MetricCardSkeleton - loading skeleton for MetricCard
 */
export default function MetricCardSkeleton() {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-20 bg-slate-700 rounded"></div>
        <div className="h-5 w-5 bg-slate-700 rounded"></div>
      </div>
      <div className="flex items-baseline gap-1">
        <div className="h-8 w-16 bg-slate-700 rounded"></div>
        <div className="h-4 w-6 bg-slate-700 rounded"></div>
      </div>
      <div className="h-3 w-24 bg-slate-700 rounded mt-2"></div>
    </div>
  );
}
