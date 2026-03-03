import type {
  Asset, Branch, Brand, Supplier, AssetType,
  MaintenanceLog, InventoryRecord, AuditLog, User, Role,
  Permission, Notification, OrgSettings,
} from './types';

function id(prefix: string, n: number) {
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 86400000).toISOString();
}

function daysFromNowStr(d: number): string {
  return new Date(Date.now() + d * 86400000).toISOString();
}

export const seedBranches: Branch[] = [
  { id: 'br-001', name: 'HQ Mumbai', location: 'Head Office', address: '123 Business Park, Andheri East', city: 'Mumbai', pincode: '400069' },
  { id: 'br-002', name: 'Delhi Office', location: 'North Region', address: '456 Connaught Place', city: 'Delhi', pincode: '110001' },
  { id: 'br-003', name: 'Bangalore Office', location: 'South Region', address: '789 Electronic City', city: 'Bangalore', pincode: '560100' },
  { id: 'br-004', name: 'Pune Warehouse', location: 'Storage', address: '321 Hinjewadi IT Park', city: 'Pune', pincode: '411057' },
];

export const seedBrands: Brand[] = [
  { id: 'brand-001', name: 'Dell', website: 'https://dell.com', description: 'Dell Technologies' },
  { id: 'brand-002', name: 'HP', website: 'https://hp.com', description: 'Hewlett-Packard' },
  { id: 'brand-003', name: 'Apple', website: 'https://apple.com', description: 'Apple Inc.' },
  { id: 'brand-004', name: 'Samsung', website: 'https://samsung.com', description: 'Samsung Electronics' },
  { id: 'brand-005', name: 'Lenovo', website: 'https://lenovo.com', description: 'Lenovo Group' },
  { id: 'brand-006', name: 'Daikin', website: 'https://daikin.com', description: 'Air Conditioning' },
];

export const seedSuppliers: Supplier[] = [
  { id: 'sup-001', companyName: 'TechWorld Solutions Pvt Ltd', contactPerson: 'Rahul Sharma', email: 'rahul@techworld.in', phone: '9876543210', address: 'Plot 5, MIDC', city: 'Mumbai', pincode: '400093', website: 'https://techworld.in' },
  { id: 'sup-002', companyName: 'Digital India Enterprises', contactPerson: 'Priya Patel', email: 'priya@digitalindia.co.in', phone: '9876543211', address: '12 Nehru Place', city: 'Delhi', pincode: '110019' },
  { id: 'sup-003', companyName: 'South IT Distribution', contactPerson: 'Karthik Reddy', email: 'karthik@southit.com', phone: '9876543212', address: '88 HSR Layout', city: 'Bangalore', pincode: '560102' },
  { id: 'sup-004', companyName: 'Office Plus Furnishings', contactPerson: 'Amit Desai', email: 'amit@officeplus.in', phone: '9876543213', address: '45 FC Road', city: 'Pune', pincode: '411004' },
];

export const seedAssetTypes: AssetType[] = [
  { id: 'at-001', name: 'Laptop', description: 'Portable computers', depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 4, salvageValuePercent: 10 },
  { id: 'at-002', name: 'Desktop', description: 'Desktop computers and workstations', depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 5, salvageValuePercent: 10 },
  { id: 'at-003', name: 'Server', description: 'Enterprise servers', depreciationMethod: 'DECLINING_BALANCE', usefulLifeYears: 7, salvageValuePercent: 5 },
  { id: 'at-004', name: 'Printer', description: 'Printers and scanners', depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 3, salvageValuePercent: 15 },
  { id: 'at-005', name: 'Air Conditioner', description: 'HVAC systems', depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 10, salvageValuePercent: 10 },
];

const assetDefs: { name: string; serial: string; price: number; brandId: string; typeId: string; branchId: string; suppId: string; daysBack: number; status: Asset['status'] }[] = [
  { name: 'Dell Latitude 5520', serial: 'LPT-20240001', price: 85000, brandId: 'brand-001', typeId: 'at-001', branchId: 'br-001', suppId: 'sup-001', daysBack: 420, status: 'ACTIVE' },
  { name: 'HP EliteBook 840 G8', serial: 'LPT-20240002', price: 92000, brandId: 'brand-002', typeId: 'at-001', branchId: 'br-002', suppId: 'sup-002', daysBack: 380, status: 'ACTIVE' },
  { name: 'Apple MacBook Pro 14"', serial: 'LPT-20240003', price: 185000, brandId: 'brand-003', typeId: 'at-001', branchId: 'br-001', suppId: 'sup-001', daysBack: 540, status: 'ACTIVE' },
  { name: 'Lenovo ThinkPad X1 Carbon', serial: 'LPT-20240004', price: 120000, brandId: 'brand-005', typeId: 'at-001', branchId: 'br-003', suppId: 'sup-003', daysBack: 290, status: 'ACTIVE' },
  { name: 'Dell Inspiron 15 3520', serial: 'LPT-20240005', price: 55000, brandId: 'brand-001', typeId: 'at-001', branchId: 'br-004', suppId: 'sup-001', daysBack: 200, status: 'UNDER_MAINTENANCE' },
  { name: 'HP ProBook 450 G9', serial: 'LPT-20240006', price: 72000, brandId: 'brand-002', typeId: 'at-001', branchId: 'br-002', suppId: 'sup-002', daysBack: 600, status: 'ACTIVE' },
  { name: 'Dell OptiPlex 7090', serial: 'DSK-20230001', price: 75000, brandId: 'brand-001', typeId: 'at-002', branchId: 'br-001', suppId: 'sup-001', daysBack: 720, status: 'ACTIVE' },
  { name: 'HP ProDesk 400 G7', serial: 'DSK-20230002', price: 68000, brandId: 'brand-002', typeId: 'at-002', branchId: 'br-002', suppId: 'sup-002', daysBack: 650, status: 'ACTIVE' },
  { name: 'Lenovo ThinkCentre M90q', serial: 'DSK-20230003', price: 72000, brandId: 'brand-005', typeId: 'at-002', branchId: 'br-003', suppId: 'sup-003', daysBack: 500, status: 'INACTIVE' },
  { name: 'Dell Precision 5860 Tower', serial: 'DSK-20230004', price: 180000, brandId: 'brand-001', typeId: 'at-002', branchId: 'br-001', suppId: 'sup-001', daysBack: 400, status: 'ACTIVE' },
  { name: 'Dell PowerEdge R750', serial: 'SRV-20220001', price: 450000, brandId: 'brand-001', typeId: 'at-003', branchId: 'br-001', suppId: 'sup-001', daysBack: 900, status: 'ACTIVE' },
  { name: 'HP ProLiant DL380 Gen10', serial: 'SRV-20220002', price: 520000, brandId: 'brand-002', typeId: 'at-003', branchId: 'br-003', suppId: 'sup-003', daysBack: 800, status: 'ACTIVE' },
  { name: 'Dell PowerEdge R650', serial: 'SRV-20220003', price: 380000, brandId: 'brand-001', typeId: 'at-003', branchId: 'br-002', suppId: 'sup-002', daysBack: 1000, status: 'UNDER_MAINTENANCE' },
  { name: 'HP LaserJet Pro M404dn', serial: 'PRT-20230001', price: 35000, brandId: 'brand-002', typeId: 'at-004', branchId: 'br-001', suppId: 'sup-001', daysBack: 450, status: 'ACTIVE' },
  { name: 'Samsung Xpress M2835DW', serial: 'PRT-20230002', price: 22000, brandId: 'brand-004', typeId: 'at-004', branchId: 'br-002', suppId: 'sup-002', daysBack: 550, status: 'ACTIVE' },
  { name: 'HP Color LaserJet Pro MFP', serial: 'PRT-20230003', price: 55000, brandId: 'brand-002', typeId: 'at-004', branchId: 'br-003', suppId: 'sup-003', daysBack: 350, status: 'DISPOSED' },
  { name: 'Daikin Split AC 1.5 Ton', serial: 'AC-20220001', price: 48000, brandId: 'brand-006', typeId: 'at-005', branchId: 'br-001', suppId: 'sup-004', daysBack: 800, status: 'ACTIVE' },
  { name: 'Daikin Cassette AC 3 Ton', serial: 'AC-20220002', price: 125000, brandId: 'brand-006', typeId: 'at-005', branchId: 'br-002', suppId: 'sup-004', daysBack: 700, status: 'ACTIVE' },
  { name: 'Daikin Tower AC 2 Ton', serial: 'AC-20220003', price: 75000, brandId: 'brand-006', typeId: 'at-005', branchId: 'br-003', suppId: 'sup-004', daysBack: 600, status: 'ACTIVE' },
  { name: 'Apple MacBook Air M2', serial: 'LPT-20240007', price: 114900, brandId: 'brand-003', typeId: 'at-001', branchId: 'br-001', suppId: 'sup-001', daysBack: 150, status: 'ACTIVE' },
];

export function generateSeedAssets(): Asset[] {
  return assetDefs.map((d, i) => {
    const purchaseDate = daysAgo(d.daysBack);
    const warrantyDate = new Date(new Date(purchaseDate).getTime() + 3 * 365 * 86400000).toISOString();
    return {
      id: id('asset', i + 1),
      assetCode: `AST-${String(i + 1).padStart(5, '0')}`,
      name: d.name,
      description: `${d.name} - Standard office equipment`,
      serialNumber: d.serial,
      status: d.status,
      purchaseDate,
      purchasePrice: d.price,
      currentValue: d.price, // Will be updated by depreciation engine
      warrantyExpiryDate: warrantyDate,
      branchId: d.branchId,
      brandId: d.brandId,
      supplierId: d.suppId,
      assetTypeId: d.typeId,
      quantity: 1,
      tags: [],
      createdAt: purchaseDate,
      updatedAt: new Date().toISOString(),
    };
  });
}

export const seedMaintenanceLogs: MaintenanceLog[] = [
  { id: 'ml-001', assetId: 'asset-0001', type: 'PREVENTIVE', scheduledDate: daysAgo(90), completedDate: daysAgo(88), cost: 2500, technicianName: 'Tech Support', description: 'Annual hardware checkup', status: 'COMPLETED', nextMaintenanceDate: daysFromNowStr(90) },
  { id: 'ml-002', assetId: 'asset-0003', type: 'CORRECTIVE', scheduledDate: daysAgo(60), completedDate: daysAgo(57), cost: 15000, technicianName: 'Tech Support', description: 'Battery replacement', status: 'COMPLETED', nextMaintenanceDate: daysFromNowStr(180) },
  { id: 'ml-003', assetId: 'asset-0005', type: 'CORRECTIVE', scheduledDate: daysAgo(7), cost: 8000, technicianName: 'Tech Support', description: 'Keyboard replacement', status: 'IN_PROGRESS' },
  { id: 'ml-004', assetId: 'asset-0011', type: 'PREVENTIVE', scheduledDate: daysFromNowStr(7), cost: 5000, technicianName: 'Tech Support', description: 'Server maintenance window', status: 'PENDING' },
  { id: 'ml-005', assetId: 'asset-0013', type: 'EMERGENCY', scheduledDate: daysAgo(3), cost: 25000, technicianName: 'Tech Support', description: 'Server crash recovery', status: 'IN_PROGRESS' },
  { id: 'ml-006', assetId: 'asset-0014', type: 'PREVENTIVE', scheduledDate: daysAgo(30), completedDate: daysAgo(28), cost: 3000, technicianName: 'Tech Support', description: 'Printer servicing', status: 'COMPLETED' },
  { id: 'ml-007', assetId: 'asset-0017', type: 'PREVENTIVE', scheduledDate: daysFromNowStr(14), cost: 4500, technicianName: 'Tech Support', description: 'AC gas refill check', status: 'PENDING' },
  { id: 'ml-008', assetId: 'asset-0006', type: 'PREVENTIVE', scheduledDate: daysAgo(120), completedDate: daysAgo(118), cost: 1000, technicianName: 'Tech Support', description: 'OS Update and cleanup', status: 'COMPLETED' },
];

export function generateSeedInventory(assets: Asset[]): InventoryRecord[] {
  return assets.map((a, i) => ({
    id: id('inv', i + 1),
    assetId: a.id,
    branchId: a.branchId || 'br-001',
    quantity: Math.floor(Math.random() * 8) + 1,
    minStockLevel: 2,
    maxStockLevel: 15,
    lastAuditDate: daysAgo(Math.floor(Math.random() * 60)),
    notes: '',
  }));
}

export const seedAuditLogs: AuditLog[] = [
  { id: 'al-001', action: 'CREATE', entityType: 'Asset', entityId: 'asset-0020', entityName: 'Apple MacBook Air M2', details: 'Asset created via manual entry', userName: 'Admin User', createdAt: daysAgo(1) },
  { id: 'al-002', action: 'UPDATE', entityType: 'Asset', entityId: 'asset-0005', entityName: 'Dell Inspiron 15 3520', details: 'Status changed to UNDER_MAINTENANCE', userName: 'Admin User', createdAt: daysAgo(2) },
  { id: 'al-003', action: 'CREATE', entityType: 'Maintenance', entityId: 'ml-005', entityName: 'Server crash recovery', details: 'Emergency maintenance scheduled', userName: 'Admin User', createdAt: daysAgo(3) },
  { id: 'al-004', action: 'IMPORT', entityType: 'Asset', entityName: 'Bulk Import', details: 'Imported 20 assets from Excel', userName: 'Admin User', createdAt: daysAgo(5) },
  { id: 'al-005', action: 'UPDATE', entityType: 'Settings', entityName: 'Organization Settings', details: 'Updated warranty alert days to 30', userName: 'Admin User', createdAt: daysAgo(7) },
  { id: 'al-006', action: 'DELETE', entityType: 'Asset', entityId: 'asset-0099', entityName: 'Old Printer', details: 'Disposed asset removed', userName: 'Manager User', createdAt: daysAgo(10) },
  { id: 'al-007', action: 'CREATE', entityType: 'Supplier', entityId: 'sup-004', entityName: 'Office Plus Furnishings', details: 'New supplier added', userName: 'Admin User', createdAt: daysAgo(14) },
];

export const seedUsers: User[] = [
  { id: 'user-001', name: 'Admin User', email: 'admin@demo.com', role: 'ADMIN', status: 'ACTIVE' },
  { id: 'user-002', name: 'Manager User', email: 'manager@demo.com', role: 'MANAGER', status: 'ACTIVE' },
  { id: 'user-003', name: 'Tech Support', email: 'tech@demo.com', role: 'TECHNICIAN', status: 'ACTIVE' },
  { id: 'user-004', name: 'Viewer User', email: 'viewer@demo.com', role: 'VIEWER', status: 'ACTIVE' },
];

const allModules = ['Dashboard', 'BI Tools', 'Assets', 'Inventory', 'Maintenance', 'Depreciation', 'Reports', 'Asset Types', 'Brands', 'Suppliers', 'Roles', 'Settings'];

function perm(mod: string, v: boolean, e: boolean, d: boolean): Permission {
  return { module: mod, canView: v, canEdit: e, canDelete: d };
}

export const seedRoles: Role[] = [
  { id: 'role-001', name: 'ADMIN', description: 'Full system access', permissions: allModules.map((m) => perm(m, true, true, true)) },
  { id: 'role-002', name: 'MANAGER', description: 'Manage assets and reports', permissions: allModules.map((m) => perm(m, true, !['Roles', 'Settings'].includes(m), false)) },
  { id: 'role-003', name: 'TECHNICIAN', description: 'Maintenance and inventory access', permissions: allModules.map((m) => perm(m, true, ['Maintenance', 'Inventory'].includes(m), false)) },
  { id: 'role-004', name: 'VIEWER', description: 'Read-only access', permissions: allModules.map((m) => perm(m, true, false, false)) },
];

export const seedNotifications: Notification[] = [
  { id: 'notif-001', title: 'Warranty Expiring Soon', message: 'Dell Latitude 5520 warranty expires in 28 days', type: 'WARNING', read: false, createdAt: daysAgo(1) },
  { id: 'notif-002', title: 'Maintenance Overdue', message: 'Server maintenance for Dell PowerEdge R650 is overdue', type: 'ERROR', read: false, createdAt: daysAgo(2) },
  { id: 'notif-003', title: 'Import Completed', message: 'Successfully imported 20 assets from Excel', type: 'SUCCESS', read: true, createdAt: daysAgo(5) },
  { id: 'notif-004', title: 'Low Stock Alert', message: 'Printer toner stock is below minimum level', type: 'WARNING', read: false, createdAt: daysAgo(3) },
  { id: 'notif-005', title: 'Monthly Depreciation Run', message: 'March 2026 depreciation has been calculated', type: 'INFO', read: true, createdAt: daysAgo(1) },
];

export const defaultSettings: OrgSettings = {
  orgName: 'Demo Corporation Pvt. Ltd.',
  address: '123 Business Park, Andheri East, Mumbai 400069',
  currency: 'INR',
  dateFormat: 'DD/MM/YYYY',
  assetCodePrefix: 'AST',
  assetCodePadding: 5,
  warrantyAlertDays: 30,
  lowStockThreshold: 5,
  defaultDepreciationMethod: 'STRAIGHT_LINE',
  fiscalYearStart: 4,
};
