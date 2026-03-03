import type { ColumnMapping } from './types';

// Layer 1: Exact column name mapping (case-insensitive)
export const EXACT_COLUMN_MAP: Record<string, string> = {
  // Asset Name
  'asset name': 'name',
  'asset_name': 'name',
  'assetname': 'name',
  'name': 'name',
  'item name': 'name',
  'item': 'name',
  'product name': 'name',
  'product': 'name',
  'equipment name': 'name',
  'equipment': 'name',
  'asset description': 'name',
  // Description
  'description': 'description',
  'desc': 'description',
  'details': 'description',
  'notes': 'description',
  'remarks': 'description',
  'comment': 'description',
  'asset details': 'description',
  // Serial Number
  'serial number': 'serialNumber',
  'serial_number': 'serialNumber',
  'serialnumber': 'serialNumber',
  'serial no': 'serialNumber',
  'serial no.': 'serialNumber',
  'serial': 'serialNumber',
  'sr no': 'serialNumber',
  'sr. no': 'serialNumber',
  'sr. no.': 'serialNumber',
  'sl no': 'serialNumber',
  'sl. no': 'serialNumber',
  // Status
  'status': 'status',
  'asset status': 'status',
  'condition': 'status',
  'state': 'status',
  'current status': 'status',
  // Purchase Date
  'purchase date': 'purchaseDate',
  'purchase_date': 'purchaseDate',
  'purchasedate': 'purchaseDate',
  'date of purchase': 'purchaseDate',
  'bought on': 'purchaseDate',
  'bought date': 'purchaseDate',
  'acquisition date': 'purchaseDate',
  'date purchased': 'purchaseDate',
  'purchase dt': 'purchaseDate',
  'date': 'purchaseDate',
  'invoice date': 'purchaseDate',
  // Purchase Price
  'purchase price': 'purchasePrice',
  'purchase_price': 'purchasePrice',
  'purchaseprice': 'purchasePrice',
  'price': 'purchasePrice',
  'cost': 'purchasePrice',
  'amount': 'purchasePrice',
  'value': 'purchasePrice',
  'purchase cost': 'purchasePrice',
  'unit price': 'purchasePrice',
  'acquisition cost': 'purchasePrice',
  'original cost': 'purchasePrice',
  'invoice amount': 'purchasePrice',
  'purchase value': 'purchasePrice',
  // Warranty
  'warranty expiry': 'warrantyExpiryDate',
  'warranty_expiry': 'warrantyExpiryDate',
  'warranty expiry date': 'warrantyExpiryDate',
  'warranty date': 'warrantyExpiryDate',
  'warranty end': 'warrantyExpiryDate',
  'warranty end date': 'warrantyExpiryDate',
  'warranty till': 'warrantyExpiryDate',
  'warranty': 'warrantyExpiryDate',
  'guarantee date': 'warrantyExpiryDate',
  // Branch
  'branch': 'branchName',
  'branch name': 'branchName',
  'branch_name': 'branchName',
  'location': 'branchName',
  'office': 'branchName',
  'office location': 'branchName',
  'site': 'branchName',
  'site name': 'branchName',
  'department': 'branchName',
  // Brand
  'brand': 'brandName',
  'brand name': 'brandName',
  'brand_name': 'brandName',
  'make': 'brandName',
  'manufacturer': 'brandName',
  'mfg': 'brandName',
  'company': 'brandName',
  'oem': 'brandName',
  // Supplier
  'supplier': 'supplierName',
  'supplier name': 'supplierName',
  'supplier_name': 'supplierName',
  'vendor': 'supplierName',
  'vendor name': 'supplierName',
  'vendor_name': 'supplierName',
  'dealer': 'supplierName',
  'dealer name': 'supplierName',
  'seller': 'supplierName',
  'purchased from': 'supplierName',
  // Asset Type
  'asset type': 'assetTypeName',
  'asset_type': 'assetTypeName',
  'assettype': 'assetTypeName',
  'type': 'assetTypeName',
  'category': 'assetTypeName',
  'asset category': 'assetTypeName',
  'class': 'assetTypeName',
  'classification': 'assetTypeName',
  'group': 'assetTypeName',
  // Quantity
  'quantity': 'quantity',
  'qty': 'quantity',
  'qty.': 'quantity',
  'count': 'quantity',
  'no of items': 'quantity',
  'units': 'quantity',
  'nos': 'quantity',
  'no.': 'quantity',
  // Tags
  'tags': 'tags',
  'tag': 'tags',
  'labels': 'tags',
  'keywords': 'tags',
  // Assigned To
  'assigned to': 'assignedTo',
  'assigned_to': 'assignedTo',
  'user': 'assignedTo',
  'assigned user': 'assignedTo',
  'custodian': 'assignedTo',
  'holder': 'assignedTo',
};

// Layer 2: Fuzzy matching
function normalize(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 100;
  if (na.includes(nb) || nb.includes(na)) return 80;
  // Simple character overlap
  const setA = new Set(na.split(''));
  const setB = new Set(nb.split(''));
  const intersection = [...setA].filter((c) => setB.has(c)).length;
  const union = new Set([...setA, ...setB]).size;
  return Math.round((intersection / union) * 100);
}

export function mapColumns(headers: string[]): ColumnMapping[] {
  const systemFields = [
    'name', 'description', 'serialNumber', 'status', 'purchaseDate',
    'purchasePrice', 'warrantyExpiryDate', 'branchName', 'brandName',
    'supplierName', 'assetTypeName', 'quantity', 'tags', 'assignedTo',
  ];
  const usedFields = new Set<string>();

  return headers.map((header) => {
    const key = header.toLowerCase().trim();

    // Layer 1: exact match
    if (EXACT_COLUMN_MAP[key] && !usedFields.has(EXACT_COLUMN_MAP[key])) {
      usedFields.add(EXACT_COLUMN_MAP[key]);
      return { excelColumn: header, systemField: EXACT_COLUMN_MAP[key], confidence: 'exact' as const };
    }

    // Layer 2: fuzzy match
    let bestMatch = '';
    let bestScore = 0;
    for (const field of systemFields) {
      if (usedFields.has(field)) continue;
      const score = similarity(key, field);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = field;
      }
      // Also check against exact map keys
      for (const [mapKey, mapVal] of Object.entries(EXACT_COLUMN_MAP)) {
        if (mapVal === field && !usedFields.has(field)) {
          const s = similarity(key, mapKey);
          if (s > bestScore) {
            bestScore = s;
            bestMatch = field;
          }
        }
      }
    }

    if (bestScore >= 60 && bestMatch && !usedFields.has(bestMatch)) {
      usedFields.add(bestMatch);
      return { excelColumn: header, systemField: bestMatch, confidence: 'fuzzy' as const };
    }

    return { excelColumn: header, systemField: '', confidence: 'unmapped' as const };
  });
}

export function parseExcelValue(value: unknown, field: string): string | number | undefined {
  if (value === null || value === undefined || value === '') return undefined;

  if (field === 'purchasePrice' || field === 'quantity') {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ''));
    return isNaN(num) ? undefined : num;
  }

  if (field === 'purchaseDate' || field === 'warrantyExpiryDate') {
    if (typeof value === 'number') {
      // Excel date serial number
      const date = new Date((value - 25569) * 86400 * 1000);
      return date.toISOString();
    }
    const d = new Date(String(value));
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  }

  if (field === 'status') {
    const s = String(value).toUpperCase().trim();
    const statusMap: Record<string, string> = {
      ACTIVE: 'ACTIVE',
      INACTIVE: 'INACTIVE',
      'UNDER MAINTENANCE': 'UNDER_MAINTENANCE',
      UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
      MAINTENANCE: 'UNDER_MAINTENANCE',
      DISPOSED: 'DISPOSED',
      LOST: 'LOST',
      WORKING: 'ACTIVE',
      'NOT WORKING': 'INACTIVE',
      BROKEN: 'UNDER_MAINTENANCE',
      SCRAPPED: 'DISPOSED',
    };
    return statusMap[s] || 'ACTIVE';
  }

  return String(value).trim();
}
