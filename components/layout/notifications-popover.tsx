"use client";

import { useState, useEffect, useCallback } from "react";
import { Bell, Clock, CheckCircle2, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useMarkNotificationAsReadMutation,
  useInfiniteNotificationsQuery,
} from "@/features/settings/hooks/useProfile";
import { format } from "date-fns";

export function NotificationsPopover() {
  const [open, setOpen] = useState(false);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteNotificationsQuery();
  const { mutate } = useMarkNotificationAsReadMutation();

  // Flatten all notifications from all pages
  const notifications = data?.pages.flatMap((page) => page.data) ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id: number) => {
    mutate([id]);
  };

  const handleMarkAllAsRead = () => {
    const unreadNotificationIds = notifications
      ?.filter((n) => !n.isRead)
      .map((n) => n.id);

    if (!unreadNotificationIds || unreadNotificationIds.length === 0) {
      return;
    }

    mutate(unreadNotificationIds);
  };

  // Scroll handler for infinite loading
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

      // Load more when user scrolls to bottom (with 100px threshold)
      if (
        scrollHeight - scrollTop <= clientHeight + 100 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative hover:bg-accent transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-4 w-4 rounded-full p-0 flex items-center justify-center text-xs font-medium text-[1px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0 shadow-lg" align="end">
        <div className="flex items-center justify-between p-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold text-base">Thông Báo</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} mới
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs h-8 px-3 hover:bg-accent"
            >
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Đánh dấu tất cả
            </Button>
          )}
        </div>
        <div
          className="max-h-[400px] overflow-y-auto scrollbar-thin"
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
              <p className="text-sm text-muted-foreground">
                Đang tải thông báo...
              </p>
            </div>
          ) : notifications?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Không có thông báo
              </p>
              <p className="text-xs text-muted-foreground">
                Bạn sẽ nhận được thông báo khi có cập nhật mới
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-border">
                {notifications?.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative p-4 hover:bg-accent/50 transition-all duration-200 cursor-pointer group",
                      !notification.isRead &&
                        "bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-l-blue-500"
                    )}
                  >
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8 mt-1 flex-shrink-0">
                        <AvatarFallback
                          className={cn(
                            "text-xs font-medium",
                            !notification.isRead
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <Bell className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              "text-sm leading-5 truncate",
                              !notification.isRead
                                ? "font-semibold text-foreground"
                                : "font-medium text-muted-foreground"
                            )}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              <span>
                                {format(
                                  new Date(notification.createdAt),
                                  "HH:mm dd/MM"
                                )}
                              </span>
                            </div>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground leading-5 line-clamp-2">
                          {notification.content}
                        </p>

                        {!notification.isRead && (
                          <div className="pt-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs h-7 px-3 hover:bg-accent text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Đánh dấu đã đọc
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Gradient overlay for read notifications */}
                    {notification.isRead && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/20 opacity-50 pointer-events-none"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Loading indicator for fetching next page */}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center p-4 border-t">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-muted-foreground">
                    Đang tải thêm...
                  </span>
                </div>
              )}

              {/* Load more button (fallback if auto-scroll doesn't work) */}
              {hasNextPage && !isFetchingNextPage && (
                <div className="p-4 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-sm"
                    onClick={() => fetchNextPage()}
                  >
                    Tải thêm thông báo
                  </Button>
                </div>
              )}
            </>
          )}

          <Separator />
          <div className="bg-white-50/50 dark:bg-blue-950/20 border-l-4 p-3" />
        </div>
      </PopoverContent>
    </Popover>
  );
}
