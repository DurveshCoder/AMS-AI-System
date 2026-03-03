'use client';

import { Bell, Search } from 'lucide-react';
import { useAMSStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const pageLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'bi-tools': 'BI Analytics',
  assets: 'Assets',
  inventory: 'Inventory',
  maintenance: 'Maintenance',
  depreciation: 'Depreciation',
  reports: 'Reports',
  'asset-types': 'Asset Types',
  brands: 'Brands',
  suppliers: 'Suppliers',
  roles: 'Roles & Access',
  settings: 'Settings',
};

export function Header() {
  const activePage = useAMSStore((s) => s.activePage);
  const setCommandOpen = useAMSStore((s) => s.setCommandOpen);
  const notifications = useAMSStore((s) => s.notifications);
  const markNotificationRead = useAMSStore((s) => s.markNotificationRead);
  const markAllNotificationsRead = useAMSStore((s) => s.markAllNotificationsRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-2">
        <nav className="flex items-center gap-1 text-sm">
          <span className="text-muted-foreground">AMS</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">{pageLabels[activePage] || activePage}</span>
        </nav>
      </div>

      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 text-muted-foreground h-8"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="pointer-events-none ml-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">Ctrl</span>K
          </kbd>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden h-8 w-8"
          onClick={() => setCommandOpen(true)}
        >
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-sm font-semibold">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsRead}
                  className="text-xs text-indigo-600 hover:text-indigo-700"
                >
                  Mark all read
                </button>
              )}
            </div>
            {notifications.slice(0, 5).map((n) => (
              <DropdownMenuItem
                key={n.id}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                onClick={() => markNotificationRead(n.id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <span className={cn('text-sm font-medium', !n.read && 'text-foreground')}>
                    {n.title}
                  </span>
                  {!n.read && (
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 bg-indigo-100 text-indigo-700">
                      New
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">{n.message}</span>
              </DropdownMenuItem>
            ))}
            {notifications.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No notifications
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          AU
        </div>
      </div>
    </header>
  );
}
