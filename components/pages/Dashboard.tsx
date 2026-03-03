'use client';

import { useMemo } from 'react';
import { Package, IndianRupee, Wrench, AlertTriangle, TrendingUp, TrendingDown, Upload, Plus, Download, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAMSStore } from '@/lib/store';
import { formatCurrency, daysFromNow } from '@/lib/utils';
import {
  AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { downloadTemplate } from '@/lib/excel-export';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function DashboardPage() {
  const assets = useAMSStore((s) => s.assets);
  const maintenanceLogs = useAMSStore((s) => s.maintenanceLogs);
  const branches = useAMSStore((s) => s.branches);
  const assetTypes = useAMSStore((s) => s.assetTypes);
  const auditLogs = useAMSStore((s) => s.auditLogs);
  const depreciationRecords = useAMSStore((s) => s.depreciationRecords);
  const setActivePage = useAMSStore((s) => s.setActivePage);

  const stats = useMemo(() => {
    const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
    const underMaintenance = assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length;
    const warrantyExpiring = assets.filter((a) => a.warrantyExpiryDate && daysFromNow(a.warrantyExpiryDate) <= 30 && daysFromNow(a.warrantyExpiryDate) > 0).length;
    const activeCount = assets.filter((a) => a.status === 'ACTIVE').length;
    const fullyDepreciated = assets.filter((a) => {
      const recs = depreciationRecords.filter((r) => r.assetId === a.id);
      if (recs.length === 0) return false;
      const last = recs[recs.length - 1];
      return last.closingValue <= a.purchasePrice * 0.1;
    }).length;
    return { totalAssets: assets.length, totalValue, underMaintenance, warrantyExpiring, activeCount, fullyDepreciated };
  }, [assets, depreciationRecords]);

  const kpis = [
    { label: 'Total Assets', value: String(stats.totalAssets), icon: Package, color: 'text-indigo-600 bg-indigo-50', change: `${stats.activeCount} active`, up: true },
    { label: 'Total Value', value: formatCurrency(stats.totalValue), icon: IndianRupee, color: 'text-emerald-600 bg-emerald-50', change: 'Current book value', up: true },
    { label: 'Under Maintenance', value: String(stats.underMaintenance), icon: Wrench, color: 'text-amber-600 bg-amber-50', change: `${maintenanceLogs.filter((m) => m.status === 'PENDING').length} pending`, up: false },
    { label: 'Warranty Expiring', value: String(stats.warrantyExpiring), icon: AlertTriangle, color: 'text-red-600 bg-red-50', change: 'Within 30 days', up: true },
  ];

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    assets.forEach((a) => { counts[a.status] = (counts[a.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({ name: status.replace(/_/g, ' '), value: count }));
  }, [assets]);

  const branchData = useMemo(() => {
    return branches.map((b) => ({
      name: b.name.replace(' Office', '').replace(' Warehouse', ''),
      count: assets.filter((a) => a.branchId === b.id).length,
      value: assets.filter((a) => a.branchId === b.id).reduce((s, a) => s + a.currentValue, 0),
    }));
  }, [assets, branches]);

  const typeData = useMemo(() => {
    return assetTypes.map((t) => ({
      name: t.name,
      count: assets.filter((a) => a.assetTypeId === t.id).length,
    }));
  }, [assets, assetTypes]);

  const valueOverTime = useMemo(() => {
    const months: { month: string; value: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      const yr = d.getFullYear();
      const mo = d.getMonth() + 1;
      let totalValue = 0;
      assets.forEach((a) => {
        const recs = depreciationRecords.filter((r) => r.assetId === a.id && (r.year < yr || (r.year === yr && r.month <= mo)));
        if (recs.length > 0) {
          totalValue += recs[recs.length - 1].closingValue;
        } else {
          totalValue += a.purchasePrice;
        }
      });
      months.push({ month: label, value: Math.round(totalValue) });
    }
    return months;
  }, [assets, depreciationRecords]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground text-balance">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Welcome back! Here is your asset overview.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{kpi.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {kpi.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {kpi.change}
                  </div>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color}`}>
                  <kpi.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Asset Value Trend (12 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={valueOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Book Value']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#areaGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" nameKey="name">
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" iconSize={8} formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assets by Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="Assets" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assets by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Count">
                    {typeData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActivePage('assets')}>
              <Plus className="h-4 w-4 text-indigo-600" /> Add New Asset
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActivePage('assets')}>
              <Upload className="h-4 w-4 text-emerald-600" /> Import from Excel
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={downloadTemplate}>
              <Download className="h-4 w-4 text-amber-600" /> Download Template
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => setActivePage('reports')}>
              <FileText className="h-4 w-4 text-blue-600" /> View Reports
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium
                    ${log.action === 'CREATE' ? 'bg-emerald-50 text-emerald-600' :
                      log.action === 'UPDATE' ? 'bg-blue-50 text-blue-600' :
                      log.action === 'DELETE' ? 'bg-red-50 text-red-600' :
                      'bg-slate-50 text-slate-600'}`}>
                    {log.action[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {log.action.charAt(0) + log.action.slice(1).toLowerCase()} {log.entityType}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {log.entityName} {log.details && `- ${log.details}`}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
