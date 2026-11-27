"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Bell, CheckCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { useDomainStore } from "@/stores/domain-store";

const subscribeToMount = () => () => {};

export function NotificationsMenu() {
  const notifications = useDomainStore((state) => state.notifications);
  const markRead = useDomainStore((state) => state.markNotificationRead);
  const markAllRead = useDomainStore((state) => state.markAllNotificationsRead);
  const dismiss = useDomainStore((state) => state.dismissNotification);
  const mounted = useSyncExternalStore(
    subscribeToMount,
    () => true,
    () => false,
  );

  const unread = mounted ? notifications.filter((item) => !item.read).length : 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={
            unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
          }
          className="relative cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <Bell aria-hidden="true" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-error px-1 text-[0.625rem] leading-4 font-semibold text-white"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <p className="text-sm font-semibold">
            Notifications
            {unread > 0 && (
              <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                {unread} unread
              </span>
            )}
          </p>
          {unread > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={markAllRead}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <CheckCheck aria-hidden="true" />
              Mark all read
            </Button>
          )}
        </div>

        {!mounted ? (
          <p className="px-3 py-6 text-center text-[0.8125rem] text-muted-foreground">
            Loading notifications…
          </p>
        ) : notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-[0.8125rem] text-muted-foreground">
            No notifications. Business events such as low stock or a received delivery
            appear here.
          </p>
        ) : (
          <ul className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={cn(
                  "flex items-start gap-2 border-b border-border px-3 py-2 last:border-b-0",
                  !notification.read && "bg-secondary/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 size-1.5 shrink-0 rounded-full",
                    notification.type === "warning" && "bg-warning",
                    notification.type === "error" && "bg-error",
                    notification.type === "success" && "bg-success",
                    notification.type === "info" && "bg-info",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[0.8125rem] leading-5 font-medium">
                    {notification.title}
                  </p>
                  <p className="text-xs leading-4 text-muted-foreground">
                    {notification.message}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-[0.625rem] text-muted-foreground">
                      {formatDateTime(notification.createdAt)}
                    </span>
                    {notification.link && (
                      <Link
                        href={notification.link}
                        onClick={() => markRead(notification.id)}
                        className="text-[0.6875rem] font-medium text-brand-text hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        Open
                      </Link>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {!notification.read && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Mark "${notification.title}" as read`}
                      onClick={() => markRead(notification.id)}
                    >
                      <CheckCheck aria-hidden="true" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Dismiss "${notification.title}"`}
                    onClick={() => dismiss(notification.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  );
}
