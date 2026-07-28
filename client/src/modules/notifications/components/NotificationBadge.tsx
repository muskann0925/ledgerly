import React from "react";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count, className = "" }) => {
  if (!count || count <= 0) return null;

  const displayCount = count > 99 ? "99+" : count;

  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-extrabold rounded-full bg-[#F97316] text-white shadow-xs animate-in zoom-in-50 duration-150 ${className}`}
    >
      {displayCount}
    </span>
  );
};
