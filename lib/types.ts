export interface Asset {
  id: string;
  assetCode: string;
  name: string;
  description?: string;
  serialNumber?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNDER_MAINTENANCE' | 'DISPOSED' | 'LOST';
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  warrantyExpiryDate?: string;
  location?: string;
  branchId?: string;
  brandId?: string;
  supplierId?: string;
  assetTypeId?: string;
  assignedToUserId?: string;
  photoUrl?: string;
  quantity: number;
  unit?: string;
  tags?: string[];
  companyPolicyNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  description?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  website?: string;
}

export interface AssetType {
  id: string;
  name: string;
  description?: string;
  depreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  usefulLifeYears: number;
  salvageValuePercent: number;
}

export interface Branch {
  id: string;
  name: string;
  location?: string;
  address?: string;
  city?: string;
  pincode?: string;
}

export interface MaintenanceLog {
  id: string;
  assetId: string;
  type: 'PREVENTIVE' | 'CORRECTIVE' | 'EMERGENCY';
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  technicianName?: string;
  description?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  nextMaintenanceDate?: string;
}

export interface DepreciationRecord {
  id: string;
  assetId: string;
  year: number;
  month: number;
  openingValue: number;
  depreciationAmount: number;
  closingValue: number;
  cumulativeDepreciation: number;
  method: string;
}

export interface InventoryRecord {
  id: string;
  assetId: string;
  branchId: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastAuditDate?: string;
  notes?: string;
}

export interface ImportJob {
  id: string;
  fileName: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  processedRows: number;
  errorRows: number;
  errors: ImportError[];
  createdAt: string;
  completedAt?: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: string;
  userName: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  module: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  read: boolean;
  createdAt: string;
}

export interface OrgSettings {
  orgName: string;
  address: string;
  currency: string;
  dateFormat: string;
  assetCodePrefix: string;
  assetCodePadding: number;
  warrantyAlertDays: number;
  lowStockThreshold: number;
  defaultDepreciationMethod: 'STRAIGHT_LINE' | 'DECLINING_BALANCE';
  fiscalYearStart: number;
}

export type PageName =
  | 'dashboard'
  | 'bi-tools'
  | 'assets'
  | 'inventory'
  | 'maintenance'
  | 'depreciation'
  | 'reports'
  | 'asset-types'
  | 'brands'
  | 'suppliers'
  | 'roles'
  | 'settings';

export interface ColumnMapping {
  excelColumn: string;
  systemField: string;
  confidence: 'exact' | 'fuzzy' | 'unmapped';
}
