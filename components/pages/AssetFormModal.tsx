'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAMSStore } from '@/lib/store';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface AssetFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: string | null;
}

const steps = ['Basic Info', 'Purchase & Supplier', 'Location', 'Classification'];

export function AssetFormModal({ open, onOpenChange, editId }: AssetFormModalProps) {
  const addAsset = useAMSStore((s) => s.addAsset);
  const updateAsset = useAMSStore((s) => s.updateAsset);
  const assets = useAMSStore((s) => s.assets);
  const brands = useAMSStore((s) => s.brands);
  const suppliers = useAMSStore((s) => s.suppliers);
  const branches = useAMSStore((s) => s.branches);
  const assetTypes = useAMSStore((s) => s.assetTypes);

  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    name: '',
    description: '',
    serialNumber: '',
    status: 'ACTIVE' as const,
    purchaseDate: '',
    purchasePrice: '',
    warrantyExpiryDate: '',
    supplierId: '',
    brandId: '',
    branchId: '',
    assetTypeId: '',
    quantity: '1',
    tags: '',
    companyPolicyNotes: '',
  });

  useEffect(() => {
    if (editId && open) {
      const asset = assets.find((a) => a.id === editId);
      if (asset) {
        setForm({
          name: asset.name,
          description: asset.description || '',
          serialNumber: asset.serialNumber || '',
          status: asset.status,
          purchaseDate: asset.purchaseDate ? asset.purchaseDate.split('T')[0] : '',
          purchasePrice: String(asset.purchasePrice),
          warrantyExpiryDate: asset.warrantyExpiryDate ? asset.warrantyExpiryDate.split('T')[0] : '',
          supplierId: asset.supplierId || '',
          brandId: asset.brandId || '',
          branchId: asset.branchId || '',
          assetTypeId: asset.assetTypeId || '',
          quantity: String(asset.quantity),
          tags: (asset.tags || []).join(', '),
          companyPolicyNotes: asset.companyPolicyNotes || '',
        });
      }
    } else if (open) {
      setForm({
        name: '', description: '', serialNumber: '', status: 'ACTIVE',
        purchaseDate: '', purchasePrice: '', warrantyExpiryDate: '',
        supplierId: '', brandId: '', branchId: '', assetTypeId: '',
        quantity: '1', tags: '', companyPolicyNotes: '',
      });
      setStep(0);
      setErrors({});
    }
  }, [editId, open, assets]);

  const set = (key: string, val: string) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => { const next = { ...e }; delete next[key]; return next; });
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0 && !form.name.trim()) e.name = 'Name is required';
    if (step === 1) {
      if (!form.purchaseDate) e.purchaseDate = 'Purchase date is required';
      if (!form.purchasePrice || isNaN(Number(form.purchasePrice)) || Number(form.purchasePrice) <= 0) e.purchasePrice = 'Valid price is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep(step + 1);
  };

  const handleSave = () => {
    if (!validateStep()) return;
    const data = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      serialNumber: form.serialNumber.trim() || undefined,
      status: form.status,
      purchaseDate: new Date(form.purchaseDate).toISOString(),
      purchasePrice: Number(form.purchasePrice),
      warrantyExpiryDate: form.warrantyExpiryDate ? new Date(form.warrantyExpiryDate).toISOString() : undefined,
      supplierId: form.supplierId || undefined,
      brandId: form.brandId || undefined,
      branchId: form.branchId || undefined,
      assetTypeId: form.assetTypeId || undefined,
      quantity: Number(form.quantity) || 1,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      companyPolicyNotes: form.companyPolicyNotes.trim() || undefined,
    };

    if (editId) {
      updateAsset(editId, data);
    } else {
      addAsset(data);
    }
    onOpenChange(false);
  };

  const selectedType = assetTypes.find((t) => t.id === form.assetTypeId);
  const depPreview = selectedType && form.purchasePrice ? (() => {
    const price = Number(form.purchasePrice);
    const salvage = price * (selectedType.salvageValuePercent / 100);
    const monthly = (price - salvage) / (selectedType.usefulLifeYears * 12);
    return { monthly, salvage, years: selectedType.usefulLifeYears };
  })() : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editId ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-4">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium',
                i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                {i + 1}
              </div>
              <span className={cn('text-xs ml-1.5 hidden sm:block', i <= step ? 'text-foreground font-medium' : 'text-muted-foreground')}>
                {s}
              </span>
              {i < steps.length - 1 && <div className={cn('flex-1 h-px mx-2', i < step ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        <div className="space-y-4 min-h-[200px]">
          {step === 0 && (
            <>
              <FormField label="Asset Name *" error={errors.name}>
                <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g., Dell Latitude 5520" />
              </FormField>
              <FormField label="Description">
                <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Optional description" rows={2} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Serial Number">
                  <Input value={form.serialNumber} onChange={(e) => set('serialNumber', e.target.value)} placeholder="e.g., LPT-20240001" />
                </FormField>
                <FormField label="Status">
                  <Select value={form.status} onValueChange={(v) => set('status', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Active</SelectItem>
                      <SelectItem value="INACTIVE">Inactive</SelectItem>
                      <SelectItem value="UNDER_MAINTENANCE">Under Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Purchase Date *" error={errors.purchaseDate}>
                  <Input type="date" value={form.purchaseDate} onChange={(e) => set('purchaseDate', e.target.value)} />
                </FormField>
                <FormField label="Purchase Price (INR) *" error={errors.purchasePrice}>
                  <Input type="number" value={form.purchasePrice} onChange={(e) => set('purchasePrice', e.target.value)} placeholder="e.g., 85000" />
                </FormField>
              </div>
              <FormField label="Warranty Expiry">
                <Input type="date" value={form.warrantyExpiryDate} onChange={(e) => set('warrantyExpiryDate', e.target.value)} />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Supplier">
                  <Select value={form.supplierId} onValueChange={(v) => set('supplierId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => <SelectItem key={s.id} value={s.id}>{s.companyName}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Brand">
                  <Select value={form.brandId} onValueChange={(v) => set('brandId', v)}>
                    <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <FormField label="Branch">
                <Select value={form.branchId} onValueChange={(v) => set('branchId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Quantity">
                <Input type="number" value={form.quantity} onChange={(e) => set('quantity', e.target.value)} min={1} />
              </FormField>
              <FormField label="Company Policy Notes">
                <Textarea value={form.companyPolicyNotes} onChange={(e) => set('companyPolicyNotes', e.target.value)} placeholder="Any notes..." rows={2} />
              </FormField>
            </>
          )}

          {step === 3 && (
            <>
              <FormField label="Asset Type">
                <Select value={form.assetTypeId} onValueChange={(v) => set('assetTypeId', v)}>
                  <SelectTrigger><SelectValue placeholder="Select asset type" /></SelectTrigger>
                  <SelectContent>
                    {assetTypes.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name} ({t.usefulLifeYears}yr, {t.salvageValuePercent}% salvage)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Tags (comma separated)">
                <Input value={form.tags} onChange={(e) => set('tags', e.target.value)} placeholder="e.g., IT, Office, Finance" />
              </FormField>
              {depPreview && (
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs font-medium text-foreground">Depreciation Preview</p>
                  <p className="text-xs text-muted-foreground">Method: {selectedType?.depreciationMethod.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">Useful Life: {depPreview.years} years</p>
                  <p className="text-xs text-muted-foreground">Monthly Depreciation: {formatCurrency(depPreview.monthly)}</p>
                  <p className="text-xs text-muted-foreground">Salvage Value: {formatCurrency(depPreview.salvage)}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => step > 0 ? setStep(step - 1) : onOpenChange(false)}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < 3 ? (
            <Button onClick={handleNext}>Next</Button>
          ) : (
            <Button onClick={handleSave}>{editId ? 'Update Asset' : 'Create Asset'}</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
