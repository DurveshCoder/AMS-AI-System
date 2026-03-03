'use client';

import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAMSStore } from '@/lib/store';
import { mapColumns, parseExcelValue } from '@/lib/excel-import';
import { generateId } from '@/lib/utils';
import type { ColumnMapping, ImportError } from '@/lib/types';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ArrowRight, X, Download } from 'lucide-react';
import { downloadTemplate } from '@/lib/excel-export';
import { cn } from '@/lib/utils';

type Step = 'upload' | 'mapping' | 'progress' | 'summary';

const SYSTEM_FIELDS = [
  { value: '', label: '-- Skip --' },
  { value: 'name', label: 'Asset Name' },
  { value: 'description', label: 'Description' },
  { value: 'serialNumber', label: 'Serial Number' },
  { value: 'status', label: 'Status' },
  { value: 'purchaseDate', label: 'Purchase Date' },
  { value: 'purchasePrice', label: 'Purchase Price' },
  { value: 'warrantyExpiryDate', label: 'Warranty Expiry' },
  { value: 'branchName', label: 'Branch' },
  { value: 'brandName', label: 'Brand' },
  { value: 'supplierName', label: 'Supplier' },
  { value: 'assetTypeName', label: 'Asset Type' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'tags', label: 'Tags' },
];

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportModal({ open, onOpenChange }: ImportModalProps) {
  const addAsset = useAMSStore((s) => s.addAsset);
  const addImportJob = useAMSStore((s) => s.addImportJob);
  const brands = useAMSStore((s) => s.brands);
  const suppliers = useAMSStore((s) => s.suppliers);
  const branches = useAMSStore((s) => s.branches);
  const assetTypes = useAMSStore((s) => s.assetTypes);
  const addBrand = useAMSStore((s) => s.addBrand);
  const addSupplier = useAMSStore((s) => s.addSupplier);
  const addBranch = useAMSStore((s) => s.addBranch);
  const addAssetType = useAMSStore((s) => s.addAssetType);
  const addAuditLog = useAMSStore((s) => s.addAuditLog);

  const [step, setStep] = useState<Step>('upload');
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [progress, setProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMappings([]);
    setProgress(0);
    setImportErrors([]);
    setImportedCount(0);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' });
      if (json.length === 0) return;
      const hdrs = Object.keys(json[0]);
      setHeaders(hdrs);
      setRows(json);
      setMappings(mapColumns(hdrs));
      setStep('mapping');
    } catch {
      setImportErrors([{ row: 0, field: 'file', message: 'Could not parse the file. Please use .xlsx or .csv format.' }]);
      setStep('summary');
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const updateMapping = (index: number, systemField: string) => {
    setMappings((prev) => prev.map((m, i) => i === index ? { ...m, systemField, confidence: systemField ? 'exact' : 'unmapped' } : m));
  };

  const findOrCreateBranch = (name: string): string => {
    const existing = branches.find((b) => b.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const created = addBranch({ name, location: name });
    return created.id;
  };

  const findOrCreateBrand = (name: string): string => {
    const existing = brands.find((b) => b.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const created = addBrand({ name });
    return created.id;
  };

  const findOrCreateSupplier = (name: string): string => {
    const existing = suppliers.find((s) => s.companyName.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const created = addSupplier({ companyName: name });
    return created.id;
  };

  const findOrCreateAssetType = (name: string): string => {
    const existing = assetTypes.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing.id;
    const created = addAssetType({ name, depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 5, salvageValuePercent: 10 });
    return created.id;
  };

  const runImport = async () => {
    setStep('progress');
    setProgress(0);
    const errors: ImportError[] = [];
    let imported = 0;

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const mapped: Record<string, unknown> = {};

      for (const m of mappings) {
        if (!m.systemField) continue;
        const rawVal = row[m.excelColumn];
        mapped[m.systemField] = parseExcelValue(rawVal, m.systemField);
      }

      // Validate
      if (!mapped.name || !String(mapped.name).trim()) {
        errors.push({ row: i + 2, field: 'name', message: 'Asset name is required' });
        setProgress(Math.round(((i + 1) / rows.length) * 100));
        continue;
      }

      try {
        // Resolve references
        let branchId: string | undefined;
        let brandId: string | undefined;
        let supplierId: string | undefined;
        let assetTypeId: string | undefined;

        if (mapped.branchName && String(mapped.branchName).trim()) {
          branchId = findOrCreateBranch(String(mapped.branchName));
        }
        if (mapped.brandName && String(mapped.brandName).trim()) {
          brandId = findOrCreateBrand(String(mapped.brandName));
        }
        if (mapped.supplierName && String(mapped.supplierName).trim()) {
          supplierId = findOrCreateSupplier(String(mapped.supplierName));
        }
        if (mapped.assetTypeName && String(mapped.assetTypeName).trim()) {
          assetTypeId = findOrCreateAssetType(String(mapped.assetTypeName));
        }

        addAsset({
          name: String(mapped.name).trim(),
          description: mapped.description ? String(mapped.description) : undefined,
          serialNumber: mapped.serialNumber ? String(mapped.serialNumber) : undefined,
          status: (mapped.status as 'ACTIVE') || 'ACTIVE',
          purchaseDate: mapped.purchaseDate ? String(mapped.purchaseDate) : new Date().toISOString(),
          purchasePrice: Number(mapped.purchasePrice) || 0,
          warrantyExpiryDate: mapped.warrantyExpiryDate ? String(mapped.warrantyExpiryDate) : undefined,
          branchId,
          brandId,
          supplierId,
          assetTypeId,
          quantity: Number(mapped.quantity) || 1,
          tags: mapped.tags ? String(mapped.tags).split(',').map((t) => t.trim()) : [],
        });
        imported++;
      } catch {
        errors.push({ row: i + 2, field: 'general', message: 'Failed to create asset' });
      }

      setProgress(Math.round(((i + 1) / rows.length) * 100));
      // Small delay for visual progress
      if (i % 5 === 0) await new Promise((r) => setTimeout(r, 50));
    }

    setImportErrors(errors);
    setImportedCount(imported);

    addImportJob({
      id: generateId(),
      fileName,
      status: errors.length > 0 && imported === 0 ? 'FAILED' : 'COMPLETED',
      totalRows: rows.length,
      processedRows: imported,
      errorRows: errors.length,
      errors,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    });

    addAuditLog({
      action: 'IMPORT',
      entityType: 'Asset',
      entityName: fileName,
      details: `Imported ${imported}/${rows.length} assets (${errors.length} errors)`,
      userName: 'Admin User',
    });

    setStep('summary');
  };

  const mappedCount = mappings.filter((m) => m.systemField).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Assets from Excel</DialogTitle>
        </DialogHeader>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-4">
          {(['upload', 'mapping', 'progress', 'summary'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div className={cn(
                'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                step === s ? 'bg-primary text-primary-foreground' :
                  (['upload', 'mapping', 'progress', 'summary'].indexOf(step) > i ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground')
              )}>
                {['upload', 'mapping', 'progress', 'summary'].indexOf(step) > i ? '\u2713' : i + 1}
              </div>
              <span className="text-[10px] ml-1 hidden sm:block text-muted-foreground capitalize">{s}</span>
              {i < 3 && <div className="flex-1 h-px mx-1.5 bg-border" />}
            </div>
          ))}
        </div>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium text-foreground">Drop your Excel file here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse (.xlsx, .csv)</p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </div>
            <Button variant="outline" className="w-full" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" /> Download Import Template
            </Button>
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">{fileName}</span>
                <Badge variant="secondary">{rows.length} rows</Badge>
              </div>
              <Badge variant={mappedCount >= 3 ? 'default' : 'destructive'}>
                {mappedCount}/{headers.length} mapped
              </Badge>
            </div>

            <div className="rounded-lg border overflow-hidden max-h-[340px] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Excel Column</TableHead>
                    <TableHead className="text-xs w-8" />
                    <TableHead className="text-xs">Maps To</TableHead>
                    <TableHead className="text-xs w-20">Confidence</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mappings.map((m, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-mono">{m.excelColumn}</TableCell>
                      <TableCell><ArrowRight className="h-3 w-3 text-muted-foreground" /></TableCell>
                      <TableCell>
                        <Select value={m.systemField || 'skip'} onValueChange={(v) => updateMapping(i, v === 'skip' ? '' : v)}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">-- Skip --</SelectItem>
                            {SYSTEM_FIELDS.filter((f) => f.value).map((f) => (
                              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.confidence === 'exact' ? 'default' : m.confidence === 'fuzzy' ? 'secondary' : 'outline'} className="text-[10px]">
                          {m.confidence}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={reset}>Back</Button>
              <Button onClick={runImport} disabled={!mappings.some((m) => m.systemField === 'name')}>
                Import {rows.length} Rows
              </Button>
            </div>
          </div>
        )}

        {/* Progress Step */}
        {step === 'progress' && (
          <div className="space-y-6 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              <p className="font-medium text-foreground">Importing assets...</p>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-center text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        )}

        {/* Summary Step */}
        {step === 'summary' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3 py-4">
              {importedCount > 0 ? (
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              ) : (
                <AlertCircle className="h-12 w-12 text-red-500" />
              )}
              <h3 className="text-lg font-semibold text-foreground">
                {importedCount > 0 ? 'Import Complete' : 'Import Failed'}
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{rows.length}</p>
                <p className="text-xs text-muted-foreground">Total Rows</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">{importedCount}</p>
                <p className="text-xs text-muted-foreground">Imported</p>
              </Card>
              <Card className="p-3 text-center">
                <p className="text-2xl font-bold text-red-600">{importErrors.length}</p>
                <p className="text-xs text-muted-foreground">Errors</p>
              </Card>
            </div>

            {importErrors.length > 0 && (
              <div className="rounded-lg border p-3 max-h-[150px] overflow-y-auto">
                <p className="text-xs font-medium text-foreground mb-2">Errors:</p>
                {importErrors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs py-1">
                    <X className="h-3 w-3 text-red-500 mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">Row {err.row}: {err.message}</span>
                  </div>
                ))}
              </div>
            )}

            <Button className="w-full" onClick={() => handleClose(false)}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-lg border bg-card', className)} {...props}>{children}</div>;
}
