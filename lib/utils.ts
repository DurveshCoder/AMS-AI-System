import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

let counter = 0;
export function generateId(): string {
  counter++;
  return `${Date.now()}-${counter}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAssetCode(existingCodes: string[], prefix = 'AST', padding = 5): string {
  let maxNum = 0;
  for (const code of existingCodes) {
    const match = code.match(new RegExp(`^${prefix}-(\\d+)$`));
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  return `${prefix}-${String(maxNum + 1).padStart(padding, '0')}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyDetailed(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateISO(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

export function daysFromNow(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    INACTIVE: 'bg-slate-100 text-slate-600',
    UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700',
    DISPOSED: 'bg-red-100 text-red-700',
    LOST: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-slate-100 text-slate-600',
    PREVENTIVE: 'bg-blue-100 text-blue-700',
    CORRECTIVE: 'bg-amber-100 text-amber-700',
    EMERGENCY: 'bg-red-100 text-red-700',
  };
  return map[status] || 'bg-slate-100 text-slate-600';
}

export function getMaintenanceTypeColor(type: string): string {
  const map: Record<string, string> = {
    PREVENTIVE: 'bg-blue-100 text-blue-700',
    CORRECTIVE: 'bg-amber-100 text-amber-700',
    EMERGENCY: 'bg-red-100 text-red-700',
  };
  return map[type] || 'bg-slate-100 text-slate-600';
}

export function truncate(str: string, len: number): string {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '...' : str;
}
