'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAMSStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, ZAxis, LineChart, Line, Legend, Cell,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export function BiToolsPage() {
  const assets = useAMSStore((s) => s.assets);
  const branches = useAMSStore((s) => s.branches);
  const assetTypes = useAMSStore((s) => s.assetTypes);
  const depreciationRecords = useAMSStore((s) => s.depreciationRecords);
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (filterBranch !== 'all' && a.branchId !== filterBranch) return false;
      if (filterType !== 'all' && a.assetTypeId !== filterType) return false;
      return true;
    });
  }, [assets, filterBranch, filterType]);

  // Stacked bar: type per branch
  const stackedData = useMemo(() => {
    return branches.map((b) => {
      const row: Record<string, number | string> = { name: b.name.replace(' Office', '').replace(' Warehouse', '') };
      assetTypes.forEach((t) => {
        row[t.name] = filteredAssets.filter((a) => a.branchId === b.id && a.assetTypeId === t.id).length;
      });
      return row;
    });
  }, [filteredAssets, branches, assetTypes]);

  // Scatter: purchase vs current
  const scatterData = useMemo(() => {
    return filteredAssets.map((a) => ({
      name: a.name,
      purchase: a.purchasePrice,
      current: a.currentValue,
      size: a.purchasePrice / 10000,
    }));
  }, [filteredAssets]);

  // Top 5 depreciation curves
  const depCurves = useMemo(() => {
    const top5 = [...filteredAssets].sort((a, b) => b.purchasePrice - a.purchasePrice).slice(0, 5);
    const months: Record<string, Record<string, number>>[] = [];
    for (let i = 0; i < 24; i++) {
      const entry: Record<string, number | string> = { month: `M${i + 1}` };
      top5.forEach((a) => {
        const recs = depreciationRecords.filter((r) => r.assetId === a.id);
        if (recs[i]) {
          entry[a.name.split(' ').slice(0, 2).join(' ')] = recs[i].closingValue;
        }
      });
      months.push(entry as never);
    }
    return { data: months, keys: top5.map((a) => a.name.split(' ').slice(0, 2).join(' ')) };
  }, [filteredAssets, depreciationRecords]);

  // Value by category (treemap substitute: horizontal bars)
  const categoryValue = useMemo(() => {
    return assetTypes.map((t) => {
      const typeAssets = filteredAssets.filter((a) => a.assetTypeId === t.id);
      return {
        name: t.name,
        value: typeAssets.reduce((s, a) => s + a.currentValue, 0),
        count: typeAssets.length,
      };
    }).sort((a, b) => b.value - a.value);
  }, [filteredAssets, assetTypes]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">BI Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Business intelligence dashboards and visualizations</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterBranch} onValueChange={setFilterBranch}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {assetTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Stacked Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Asset Types per Branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="circle" iconSize={8} />
                  {assetTypes.map((t, i) => (
                    <Bar key={t.id} dataKey={t.name} stackId="a" fill={COLORS[i % COLORS.length]} radius={i === assetTypes.length - 1 ? [4, 4, 0, 0] : undefined} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Scatter */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Purchase Price vs Current Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" dataKey="purchase" name="Purchase" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="number" dataKey="current" name="Current" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <ZAxis type="number" dataKey="size" range={[40, 400]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Scatter data={scatterData} fill="#6366f1" fillOpacity={0.6} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Value */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Value by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryValue} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} />
                  <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip formatter={(v: number) => [formatCurrency(v), 'Value']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Total Value">
                    {categoryValue.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Depreciation */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top 5 Asset Depreciation Curves</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={depCurves.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Legend iconType="line" iconSize={12} />
                  {depCurves.keys.map((key, i) => (
                    <Line key={key} type="monotone" dataKey={key} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
