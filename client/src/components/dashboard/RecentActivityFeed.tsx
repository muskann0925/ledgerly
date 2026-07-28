import React from "react";
import { CheckCircle2, FilePlus, Send, UserPlus, Clock, Activity } from "lucide-react";
import type { ActivityLogItem } from "../../modules/dashboard/api/dashboard.api";

interface RecentActivityFeedProps {
  activities?: ActivityLogItem[];
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities = [],
}) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case "PAID":
        return { icon: CheckCircle2, iconBg: "bg-emerald-100 text-[#16A34A] dark:bg-emerald-950/60 dark:text-emerald-400" };
      case "CLIENT":
        return { icon: UserPlus, iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400" };
      case "REMINDER":
        return { icon: Send, iconBg: "bg-amber-100 text-[#F59E0B] dark:bg-amber-950/60 dark:text-amber-400" };
      default:
        return { icon: FilePlus, iconBg: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#111827] dark:text-white">
            Recent Activity
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time activity log for billing operations.
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center text-slate-700 dark:text-slate-200">
          <Clock className="w-4 h-4 text-[#F97316]" />
        </div>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3 max-h-[210px] overflow-y-auto pr-2 flex-1">
          {activities.map((item) => {
            const { icon: Icon, iconBg } = getIconForType(item.type);
            return (
              <div key={item.id} className="flex items-start gap-3 text-xs">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0 ml-2">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5 truncate text-[11px]">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 text-center flex-1">
          <Activity className="w-7 h-7 text-slate-400" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No Recent Activity
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs px-4">
            System logs and billing actions will be recorded here automatically.
          </p>
        </div>
      )}
    </div>
  );
};
