'use client';

import {
  LayoutDashboard, Package, BarChart3, Boxes, Wrench,
  TrendingDown, FileText, Tags, Award, Truck,
  Shield, Settings, ChevronLeft, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAMSStore } from '@/lib/store';
import type { PageName } from '@/lib/types';
import { cn } from '@/lib/utils';

const navItems: { page: PageName; icon: React.ElementType; label: string }[] = [
  { page: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { page: 'bi-tools', icon: BarChart3, label: 'BI Tools' },
  { page: 'assets', icon: Package, label: 'Assets' },
  { page: 'inventory', icon: Boxes, label: 'Inventory' },
  { page: 'maintenance', icon: Wrench, label: 'Maintenance' },
  { page: 'depreciation', icon: TrendingDown, label: 'Depreciation' },
  { page: 'reports', icon: FileText, label: 'Reports' },
  { page: 'asset-types', icon: Tags, label: 'Asset Types' },
  { page: 'brands', icon: Award, label: 'Brands' },
  { page: 'suppliers', icon: Truck, label: 'Suppliers' },
  { page: 'roles', icon: Shield, label: 'Roles & Access' },
  { page: 'settings', icon: Settings, label: 'Settings' },
];

export function Sidebar() {
  const activePage = useAMSStore((s) => s.activePage);
  const setActivePage = useAMSStore((s) => s.setActivePage);
  const collapsed = useAMSStore((s) => s.sidebarCollapsed);
  const setCollapsed = useAMSStore((s) => s.setSidebarCollapsed);

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-slate-900 text-slate-100 z-40 transition-all duration-300 flex-col hidden md:flex',
          collapsed ? 'w-16' : 'w-60'
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/30">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-white whitespace-nowrap">
                AMS Pro
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = activePage === item.page;
              return (
                <li key={item.page}>
                  <button
                    onClick={() => setActivePage(item.page)}
                    title={item.label}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                      collapsed && 'justify-center px-2'
                    )}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + Collapse */}
        <div className="border-t border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/20 text-indigo-400 text-sm font-semibold">
                AU
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">Admin User</p>
                <p className="text-xs text-slate-500 truncate">admin@demo.com</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center h-10 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden bg-slate-900 border-t border-slate-700/50 overflow-x-auto">
        {navItems.slice(0, 6).map((item) => {
          const isActive = activePage === item.page;
          return (
            <button
              key={item.page}
              onClick={() => setActivePage(item.page)}
              className={cn(
                'flex flex-1 flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors min-w-[60px]',
                isActive ? 'text-indigo-400' : 'text-slate-500'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={() => setActivePage('settings')}
          className={cn(
            'flex flex-1 flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium transition-colors min-w-[60px]',
            activePage === 'settings' ? 'text-indigo-400' : 'text-slate-500'
          )}
        >
          <Settings className="h-5 w-5" />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
