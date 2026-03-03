'use client';

import { useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAMSStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';
import { getDepreciationSummary } from '@/lib/depreciation';
import { Package, Calendar, MapPin, Tag, Wrench, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

export function AssetDetailSheet() {
  const selectedAssetId = useAMSStore((s) => s.selectedAssetId);
  const setSelectedAsset = useAMSStore((s) => s.setSelectedAsset);
  const assets = useAMSStore((s) => s.assets);
  const brands = useAMSStore((s) => s.brands);
  const branches = useAMSStore((s) => s.branches);
  const suppliers = useAMSStore((s) => s.suppliers);
  const assetTypes = useAMSStore((s) => s.assetTypes);
  const depreciationRecords = useAMSStore((s) => s.depreciationRecords);
  const maintenanceLogs = useAMSStore((s) => s.maintenanceLogs);

  const [depPage, setDepPage] = useState(0);
  const PER_PAGE = 12;

  const asset = assets.find((a) => a.id === selectedAssetId);
  const assetType = assetTypes.find((t) => t.id === asset?.assetTypeId);
  const brand = brands.find((b) => b.id === asset?.brandId);
  const branch = branches.find((b) => b.id === asset?.branchId);
  const supplier = suppliers.find((s) => s.id === asset?.supplierId);

  const depRecords = useMemo(() => {
    if (!asset) return [];
    return depreciationRecords.filter((r) => r.assetId === asset.id).sort((a, b) => a.year !== b.year ? a.year - b.year : a.month - b.month);
  }, [asset, depreciationRecords]);

  const summary = useMemo(() => {
    if (!asset) return null;
    return getDepreciationSummary(asset, assetType, depreciationRecords);
  }, [asset, assetType, depreciationRecords]);

  const chartData = useMemo(() => {
    return depRecords.map((r) => ({
      label: `${String(r.month).padStart(2, '0')}/${r.year}`,
      value: r.closingValue,
      year: r.year,
      month: r.month,
    }));
  }, [depRecords]);

  const assetMaintenanceLogs = useMemo(() => {
    if (!asset) return [];
    return maintenanceLogs.filter((m) => m.assetId === asset.id);
  }, [asset, maintenanceLogs]);

  const totalDepPages = Math.ceil(depRecords.length / PER_PAGE);
  const pagedRecords = depRecords.slice(depPage * PER_PAGE, (depPage + 1) * PER_PAGE);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (!asset) return null;

  return (
    <Sheet open={!!selectedAssetId} onOpenChange={(v) => { if (!v) setSelectedAsset(null); }}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-lg">{asset.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-mono text-muted-foreground">{asset.assetCode}</span>
                <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(asset.status))}>
                  {asset.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-6">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
            <TabsTrigger value="depreciation" className="flex-1">Depreciation</TabsTrigger>
            <TabsTrigger value="maintenance" className="flex-1">Maintenance</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Serial Number" value={asset.serialNumber || '-'} />
              <InfoRow label="Brand" value={brand?.name || '-'} />
              <InfoRow label="Asset Type" value={assetType?.name || '-'} />
              <InfoRow label="Branch" value={branch?.name || '-'} />
              <InfoRow label="Supplier" value={supplier?.companyName || '-'} />
              <InfoRow label="Purchase Date" value={formatDate(asset.purchaseDate)} />
              <InfoRow label="Purchase Price" value={formatCurrency(asset.purchasePrice)} />
              <InfoRow label="Current Value" value={formatCurrency(asset.currentValue)} />
              <InfoRow label="Warranty Expiry" value={formatDate(asset.warrantyExpiryDate)} />
              <InfoRow label="Quantity" value={String(asset.quantity)} />
            </div>
            {asset.description && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Description</p>
                <p className="text-sm text-foreground">{asset.description}</p>
              </div>
            )}
          </TabsContent>

          {/* Depreciation Tab */}
          <TabsContent value="depreciation" className="mt-4 space-y-4">
            {summary && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Card><CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Original Cost</p>
                    <p className="text-lg font-bold text-foreground">{formatCurrency(summary.originalCost)}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Current Book Value</p>
                    <p className="text-lg font-bold text-emerald-600">{formatCurrency(summary.currentBookValue)}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Total Depreciated</p>
                    <p className="text-lg font-bold text-amber-600">{formatCurrency(summary.totalDepreciated)}</p>
                  </CardContent></Card>
                  <Card><CardContent className="p-3">
                    <p className="text-xs text-muted-foreground">Remaining Life</p>
                    <p className="text-lg font-bold text-foreground">{Math.floor(summary.remainingLifeMonths / 12)}y {summary.remainingLifeMonths % 12}m</p>
                  </CardContent></Card>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Depreciated</span>
                    <span className="text-xs font-medium">{summary.percentDepreciated.toFixed(1)}%</span>
                  </div>
                  <Progress value={summary.percentDepreciated} className="h-2" />
                </div>
              </>
            )}

            {/* Chart */}
            {chartData.length > 0 && (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} interval={Math.max(0, Math.floor(chartData.length / 6))} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), 'Book Value']} contentStyle={{ borderRadius: '8px', fontSize: 12, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <defs>
                      <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#depGrad)" strokeWidth={2} />
                    <ReferenceLine
                      x={`${String(currentMonth).padStart(2, '0')}/${currentYear}`}
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      label={{ value: 'Today', position: 'top', fill: '#ef4444', fontSize: 10 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Schedule Table */}
            {depRecords.length > 0 && (
              <>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">Period</TableHead>
                        <TableHead className="text-xs text-right">Opening</TableHead>
                        <TableHead className="text-xs text-right">Depreciation</TableHead>
                        <TableHead className="text-xs text-right">Closing</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pagedRecords.map((r) => {
                        const isCurrent = r.year === currentYear && r.month === currentMonth;
                        return (
                          <TableRow key={r.id} className={cn(isCurrent && 'bg-indigo-50')}>
                            <TableCell className="text-xs font-mono">
                              {String(r.month).padStart(2, '0')}/{r.year}
                              {isCurrent && <Badge variant="secondary" className="ml-2 text-[10px] h-4 bg-indigo-100 text-indigo-700">Current</Badge>}
                            </TableCell>
                            <TableCell className="text-xs text-right">{formatCurrency(r.openingValue)}</TableCell>
                            <TableCell className="text-xs text-right text-red-600">-{formatCurrency(r.depreciationAmount)}</TableCell>
                            <TableCell className="text-xs text-right font-medium">{formatCurrency(r.closingValue)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                {totalDepPages > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Page {depPage + 1} of {totalDepPages}</span>
                    <div className="flex gap-1">
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={depPage === 0} onClick={() => setDepPage(depPage - 1)}>
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7" disabled={depPage >= totalDepPages - 1} onClick={() => setDepPage(depPage + 1)}>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="mt-4 space-y-3">
            {assetMaintenanceLogs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8">
                <Wrench className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No maintenance logs</p>
              </div>
            ) : (
              assetMaintenanceLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(log.type))}>
                          {log.type}
                        </span>
                        <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(log.status))}>
                          {log.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatDate(log.scheduledDate)}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground">{log.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Cost: {formatCurrency(log.cost)}</span>
                      {log.technicianName && <span>Tech: {log.technicianName}</span>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
    </div>
  );
}
