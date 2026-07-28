import React from "react";
import type { NotificationItemData } from "../types/notification.types";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";

interface NotificationListProps {
  notifications: NotificationItemData[];
  isLoading?: boolean;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  isCompact?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  isLoading = false,
  onMarkAsRead,
  onDelete,
  isCompact = false,
  emptyTitle,
  emptyDescription,
}) => {
  if (isLoading) {
    return <LoadingState count={isCompact ? 3 : 5} />;
  }

  if (!notifications || notifications.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="space-y-2.5">
      {notifications.map((item) => (
        <NotificationItem
          key={item.id}
          notification={item}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
          isCompact={isCompact}
        />
      ))}
    </div>
  );
};
