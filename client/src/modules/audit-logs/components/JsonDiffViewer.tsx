import React from "react";

interface JsonDiffViewerProps {
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
}

export const JsonDiffViewer: React.FC<JsonDiffViewerProps> = ({ oldValue, newValue }) => {
  const hasOld = oldValue && Object.keys(oldValue).length > 0;
  const hasNew = newValue && Object.keys(newValue).length > 0;

  if (!hasOld && !hasNew) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        No state snapshot captured for this log entry.
      </div>
    );
  }

  // Collect all keys across both objects
  const allKeys = Array.from(
    new Set([...Object.keys(oldValue || {}), ...Object.keys(newValue || {})])
  );

  return (
    <div className="space-y-4">
      {/* Side-by-side Diff Table */}
      {hasOld && hasNew ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
          <div className="grid grid-cols-3 bg-slate-50 dark:bg-slate-900/60 p-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:border-slate-800">
            <div>Field Key</div>
            <div className="text-rose-600 dark:text-rose-400">Old State</div>
            <div className="text-emerald-600 dark:text-emerald-400">New State</div>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
            {allKeys.map((key) => {
              const oldVal = oldValue?.[key];
              const newVal = newValue?.[key];
              const isModified = JSON.stringify(oldVal) !== JSON.stringify(newVal);

              const formatVal = (val: any) => {
                if (val === undefined) return <span className="italic text-slate-400 text-[11px]">N/A</span>;
                if (val === null) return <span className="italic text-slate-400 text-[11px]">null</span>;
                if (typeof val === "boolean")
                  return (
                    <span
                      className={`font-semibold text-[11px] ${
                        val ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {String(val)}
                    </span>
                  );
                if (typeof val === "object")
                  return <pre className="text-[10px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{JSON.stringify(val, null, 2)}</pre>;
                return <span className="text-xs text-slate-800 dark:text-slate-200 font-mono">{String(val)}</span>;
              };

              return (
                <div
                  key={key}
                  className={`grid grid-cols-3 p-3 items-start gap-2 text-xs transition-colors ${
                    isModified
                      ? "bg-amber-500/5 dark:bg-amber-500/10"
                      : "hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                  }`}
                >
                  <div className="font-semibold text-slate-700 dark:text-slate-300 font-mono truncate" title={key}>
                    {key}
                  </div>
                  <div className={`p-1.5 rounded-lg border text-xs break-all ${isModified ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50 text-rose-900 dark:text-rose-200" : "border-transparent"}`}>
                    {formatVal(oldVal)}
                  </div>
                  <div className={`p-1.5 rounded-lg border text-xs break-all ${isModified ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200" : "border-transparent"}`}>
                    {formatVal(newVal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Single JSON Tree Display */
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto shadow-inner">
          <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-800 pb-1">
            {hasNew ? "New State Snapshot" : "Old State Snapshot"}
          </div>
          <pre className="text-emerald-400 text-xs leading-relaxed">
            {JSON.stringify(hasNew ? newValue : oldValue, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
