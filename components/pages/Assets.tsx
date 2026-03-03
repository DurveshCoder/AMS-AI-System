'use client';

import { useState, useMemo } from 'react';
import { Plus, Upload, LayoutGrid, LayoutList, Search, X, Trash2, Download, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAMSStore } from '@/lib/store';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';
import { AssetDetailSheet } from './AssetDetail';
import { AssetFormModal } from './AssetFormModal';
import { ImportModal } from '@/components/import/ImportModal';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { exportToExcel } from '@/lib/excel-export';

export function AssetsPage() {
  const assets = useAMSStore((s) => s.assets);
  const brands = useAMSStore((s) => s.brands);
  const branches = useAMSStore((s) => s.branches);
  const assetTypes = useAMSStore((s) => s.assetTypes);
  const selectedAssetId = useAMSStore((s) => s.selectedAssetId);
  const setSelectedAsset = useAMSStore((s) => s.setSelectedAsset);
  const bulkDeleteAssets = useAMSStore((s) => s.bulkDeleteAssets);

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterBrand, setFilterBrand] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [editAssetId, setEditAssetId] = useState<string | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (search) {
        const q = search.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.assetCode.toLowerCase().includes(q) && !(a.serialNumber || '').toLowerCase().includes(q)) return false;
      }
      if (filterStatus !== 'all' && a.status !== filterStatus) return false;
      if (filterBranch !== 'all' && a.branchId !== filterBranch) return false;
      if (filterBrand !== 'all' && a.brandId !== filterBrand) return false;
      if (filterType !== 'all' && a.assetTypeId !== filterType) return false;
      return true;
    });
  }, [assets, search, filterStatus, filterBranch, filterBrand, filterType]);

  const hasFilters = search || filterStatus !== 'all' || filterBranch !== 'all' || filterBrand !== 'all' || filterType !== 'all';

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterBranch('all');
    setFilterBrand('all');
    setFilterType('all');
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  };

  const getBrandName = (id?: string) => brands.find((b) => b.id === id)?.name || '-';
  const getBranchName = (id?: string) => branches.find((b) => b.id === id)?.name || '-';
  const getTypeName = (id?: string) => assetTypes.find((t) => t.id === id)?.name || '-';

  const handleExportSelected = () => {
    const data = filtered.filter((a) => selectedIds.has(a.id)).map((a) => ({
      assetCode: a.assetCode,
      name: a.name,
      status: a.status,
      purchasePrice: a.purchasePrice,
      currentValue: a.currentValue,
      brand: getBrandName(a.brandId),
      branch: getBranchName(a.branchId),
      type: getTypeName(a.assetTypeId),
      purchaseDate: formatDate(a.purchaseDate),
    }));
    exportToExcel(data, [
      { key: 'assetCode', header: 'Asset Code' }, { key: 'name', header: 'Name' },
      { key: 'status', header: 'Status' }, { key: 'type', header: 'Type' },
      { key: 'brand', header: 'Brand' }, { key: 'branch', header: 'Branch' },
      { key: 'purchasePrice', header: 'Purchase Price' }, { key: 'currentValue', header: 'Current Value' },
      { key: 'purchaseDate', header: 'Purchase Date' },
    ], 'AMS_Assets_Export');
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
          <Badge variant="secondary" className="font-mono">{filtered.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setViewMode('list')} className={cn('p-2 transition-colors', viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
              <LayoutList className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={cn('p-2 transition-colors', viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted')}>
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Asset
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search assets..." className="pl-9 h-9" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
            <SelectItem value="DISPOSED">Disposed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterBrand} onValueChange={setFilterBrand}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Brand" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {assetTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="h-4 w-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200">
          <span className="text-sm font-medium text-indigo-700">{selectedIds.size} selected</span>
          <Button size="sm" variant="outline" onClick={handleExportSelected}>
            <Download className="h-3.5 w-3.5 mr-1" /> Export
          </Button>
          <Button size="sm" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())}>Cancel</Button>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' ? (
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selectedIds.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </TableHead>
                  <TableHead>Asset Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Purchase</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((asset) => (
                  <TableRow key={asset.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedAsset(asset.id)}>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={selectedIds.has(asset.id)} onCheckedChange={() => toggleSelect(asset.id)} />
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{asset.assetCode}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{asset.name}</p>
                        {asset.serialNumber && <p className="text-xs text-muted-foreground">{asset.serialNumber}</p>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{getTypeName(asset.assetTypeId)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{getBrandName(asset.brandId)}</TableCell>
                    <TableCell className="text-sm">{getBranchName(asset.branchId)}</TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(asset.status))}>
                        {asset.status.replace(/_/g, ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">{formatCurrency(asset.purchasePrice)}</TableCell>
                    <TableCell className={cn('text-right text-sm font-medium', asset.currentValue < asset.purchasePrice * 0.3 ? 'text-red-600' : asset.currentValue < asset.purchasePrice * 0.6 ? 'text-amber-600' : 'text-emerald-600')}>
                      {formatCurrency(asset.currentValue)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(asset.purchaseDate)}</TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No assets found</p>
                        {hasFilters && <Button variant="link" size="sm" onClick={clearFilters}>Clear filters</Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      ) : (
        /* Grid view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((asset) => (
            <Card key={asset.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedAsset(asset.id)}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Package className="h-5 w-5" />
                  </div>
                  <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', getStatusColor(asset.status))}>
                    {asset.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-sm truncate">{asset.name}</h3>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">{asset.assetCode}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground">Current Value</p>
                    <p className="text-sm font-semibold text-foreground">{formatCurrency(asset.currentValue)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Branch</p>
                    <p className="text-sm text-foreground">{getBranchName(asset.branchId)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-2 py-12">
              <Package className="h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No assets found</p>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <AssetDetailSheet />
      <AssetFormModal open={showAddModal || !!editAssetId} onOpenChange={(v) => { if (!v) { setShowAddModal(false); setEditAssetId(null); } }} editId={editAssetId} />
      <ImportModal open={showImportModal} onOpenChange={setShowImportModal} />
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Selected Assets"
        description={`Are you sure you want to delete ${selectedIds.size} asset(s)? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { bulkDeleteAssets(Array.from(selectedIds)); setSelectedIds(new Set()); }}
      />
    </div>
  );
}
