'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAMSStore } from '@/lib/store';
import { formatDate, cn } from '@/lib/utils';
import { Search, Package, AlertTriangle, CheckCircle2, ArrowDown, ArrowUp, Pencil } from 'lucide-react';

export function InventoryPage() {
  const inventoryRecords = useAMSStore((s) => s.inventoryRecords);
  const assets = useAMSStore((s) => s.assets);
  const branches = useAMSStore((s) => s.branches);
  const updateInventory = useAMSStore((s) => s.updateInventory);
  const settings = useAMSStore((s) => s.settings);

  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStock, setFilterStock] = useState('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ quantity: '', minStockLevel: '', maxStockLevel: '', notes: '' });

  const enriched = useMemo(() => {
    return inventoryRecords.map((inv) => {
      const asset = assets.find((a) => a.id === inv.assetId);
      const branch = branches.find((b) => b.id === inv.branchId);
      return { ...inv, assetName: asset?.name || 'Unknown', assetCode: asset?.assetCode || '', branchName: branch?.name || '-' };
    });
  }, [inventoryRecords, assets, branches]);

  const filtered = useMemo(() => {
    return enriched.filter((inv) => {
      if (search) {
        const q = search.toLowerCase();
        if (!inv.assetName.toLowerCase().includes(q) && !inv.assetCode.toLowerCase().includes(q)) return false;
      }
      if (filterBranch !== 'all' && inv.branchId !== filterBranch) return false;
      if (filterStock === 'low' && inv.quantity >= inv.minStockLevel) return false;
      if (filterStock === 'ok' && inv.quantity < inv.minStockLevel) return false;
      return true;
    });
  }, [enriched, search, filterBranch, filterStock]);

  const stats = useMemo(() => {
    const total = inventoryRecords.reduce((s, r) => s + r.quantity, 0);
    const low = inventoryRecords.filter((r) => r.quantity < r.minStockLevel).length;
    const ok = inventoryRecords.filter((r) => r.quantity >= r.minStockLevel).length;
    return { total, low, ok };
  }, [inventoryRecords]);

  const openEdit = (id: string) => {
    const rec = inventoryRecords.find((r) => r.id === id);
    if (rec) {
      setEditForm({
        quantity: String(rec.quantity),
        minStockLevel: String(rec.minStockLevel),
        maxStockLevel: String(rec.maxStockLevel),
        notes: rec.notes || '',
      });
      setEditId(id);
    }
  };

  const saveEdit = () => {
    if (!editId) return;
    updateInventory(editId, {
      quantity: Number(editForm.quantity) || 0,
      minStockLevel: Number(editForm.minStockLevel) || 0,
      maxStockLevel: Number(editForm.maxStockLevel) || 0,
      notes: editForm.notes || undefined,
      lastAuditDate: new Date().toISOString(),
    });
    setEditId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inventory</h1>
          <p className="text-sm text-muted-foreground mt-1">Track stock levels across branches</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Units</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.low}</p>
              <p className="text-xs text-muted-foreground">Low Stock</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-600">{stats.ok}</p>
              <p className="text-xs text-muted-foreground">Adequate Stock</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..." className="pl-9 h-9" />
        </div>
        <Select value={filterBranch} onValueChange={setFilterBranch}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Branch" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStock} onValueChange={setFilterStock}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Stock Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="low">Low Stock</SelectItem>
            <SelectItem value="ok">Adequate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-center">Min</TableHead>
                <TableHead className="text-center">Max</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Audit</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => {
                const isLow = inv.quantity < inv.minStockLevel;
                const isOver = inv.quantity > inv.maxStockLevel;
                return (
                  <TableRow key={inv.id}>
                    <TableCell>
                      <p className="font-medium text-sm text-foreground">{inv.assetName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{inv.assetCode}</p>
                    </TableCell>
                    <TableCell className="text-sm">{inv.branchName}</TableCell>
                    <TableCell className="text-center">
                      <span className={cn('font-semibold text-sm', isLow ? 'text-red-600' : isOver ? 'text-amber-600' : 'text-foreground')}>
                        {inv.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">{inv.minStockLevel}</TableCell>
                    <TableCell className="text-center text-sm text-muted-foreground">{inv.maxStockLevel}</TableCell>
                    <TableCell>
                      {isLow ? (
                        <Badge variant="destructive" className="text-[10px] gap-1"><ArrowDown className="h-2.5 w-2.5" />Low</Badge>
                      ) : isOver ? (
                        <Badge className="text-[10px] gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100"><ArrowUp className="h-2.5 w-2.5" />Over</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">OK</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(inv.lastAuditDate)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(inv.id)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No inventory records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={!!editId} onOpenChange={(v) => { if (!v) setEditId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Edit Inventory</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Quantity</Label>
              <Input type="number" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm">Min Stock</Label>
                <Input type="number" value={editForm.minStockLevel} onChange={(e) => setEditForm({ ...editForm, minStockLevel: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Max Stock</Label>
                <Input type="number" value={editForm.maxStockLevel} onChange={(e) => setEditForm({ ...editForm, maxStockLevel: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Notes</Label>
              <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
              <Button onClick={saveEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
