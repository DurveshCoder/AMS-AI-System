import { create } from 'zustand';
import type {
  Asset, Brand, Supplier, Branch, AssetType,
  MaintenanceLog, DepreciationRecord, InventoryRecord,
  ImportJob, AuditLog, User, Role, Notification, OrgSettings,
  PageName,
} from './types';
import {
  seedBranches, seedBrands, seedSuppliers, seedAssetTypes,
  generateSeedAssets, seedMaintenanceLogs, generateSeedInventory,
  seedAuditLogs, seedUsers, seedRoles, seedNotifications, defaultSettings,
} from './seed-data';
import { generateDepreciationForAsset, getCurrentBookValue } from './depreciation';
import { generateId, generateAssetCode } from './utils';

interface AMSState {
  // Data
  assets: Asset[];
  brands: Brand[];
  suppliers: Supplier[];
  branches: Branch[];
  assetTypes: AssetType[];
  maintenanceLogs: MaintenanceLog[];
  depreciationRecords: DepreciationRecord[];
  inventoryRecords: InventoryRecord[];
  importJobs: ImportJob[];
  auditLogs: AuditLog[];
  users: User[];
  roles: Role[];
  notifications: Notification[];
  settings: OrgSettings;

  // UI State
  activePage: PageName;
  selectedAssetId: string | null;
  searchQuery: string;
  commandOpen: boolean;
  sidebarCollapsed: boolean;

  // Navigation
  setActivePage: (page: PageName) => void;
  setSelectedAsset: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  setCommandOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Asset CRUD
  addAsset: (asset: Omit<Asset, 'id' | 'assetCode' | 'currentValue' | 'createdAt' | 'updatedAt'>) => Asset;
  updateAsset: (id: string, data: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  bulkDeleteAssets: (ids: string[]) => void;

  // Brand CRUD
  addBrand: (brand: Omit<Brand, 'id'>) => Brand;
  updateBrand: (id: string, data: Partial<Brand>) => void;
  deleteBrand: (id: string) => void;

  // Supplier CRUD
  addSupplier: (supplier: Omit<Supplier, 'id'>) => Supplier;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Branch CRUD
  addBranch: (branch: Omit<Branch, 'id'>) => Branch;
  updateBranch: (id: string, data: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;

  // AssetType CRUD
  addAssetType: (at: Omit<AssetType, 'id'>) => AssetType;
  updateAssetType: (id: string, data: Partial<AssetType>) => void;
  deleteAssetType: (id: string) => void;

  // Maintenance
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => void;
  updateMaintenanceLog: (id: string, data: Partial<MaintenanceLog>) => void;
  deleteMaintenanceLog: (id: string) => void;

  // Inventory
  updateInventory: (id: string, data: Partial<InventoryRecord>) => void;

  // Depreciation
  runDepreciationForAsset: (assetId: string) => void;
  getBookValue: (assetId: string) => number;

  // Roles & Users
  updateRole: (id: string, data: Partial<Role>) => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;

  // Import
  addImportJob: (job: ImportJob) => void;

  // Notifications
  addNotification: (n: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Audit
  addAuditLog: (log: Omit<AuditLog, 'id' | 'createdAt'>) => void;

  // Settings
  updateSettings: (data: Partial<OrgSettings>) => void;
}

function initializeStore() {
  const assets = generateSeedAssets();
  const inventory = generateSeedInventory(assets);

  // Generate depreciation records for all assets
  const allDepRecords: DepreciationRecord[] = [];
  for (const asset of assets) {
    const assetType = seedAssetTypes.find((t) => t.id === asset.assetTypeId);
    if (assetType) {
      const records = generateDepreciationForAsset(asset, assetType);
      allDepRecords.push(...records);
      // Update current value
      if (records.length > 0) {
        const bookValue = getCurrentBookValue(asset.id, records);
        asset.currentValue = bookValue;
      }
    }
  }

  return { assets, inventory, depreciationRecords: allDepRecords };
}

const { assets: initAssets, inventory: initInventory, depreciationRecords: initDepRecords } = initializeStore();

export const useAMSStore = create<AMSState>((set, get) => ({
  // Initial data
  assets: initAssets,
  brands: seedBrands,
  suppliers: seedSuppliers,
  branches: seedBranches,
  assetTypes: seedAssetTypes,
  maintenanceLogs: seedMaintenanceLogs,
  depreciationRecords: initDepRecords,
  inventoryRecords: initInventory,
  importJobs: [],
  auditLogs: seedAuditLogs,
  users: seedUsers,
  roles: seedRoles,
  notifications: seedNotifications,
  settings: defaultSettings,

  // UI State
  activePage: 'dashboard',
  selectedAssetId: null,
  searchQuery: '',
  commandOpen: false,
  sidebarCollapsed: false,

  // Navigation
  setActivePage: (page) => set({ activePage: page, selectedAssetId: null }),
  setSelectedAsset: (id) => set({ selectedAssetId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setSidebarCollapsed: (c) => set({ sidebarCollapsed: c }),

  // Asset CRUD
  addAsset: (data) => {
    const state = get();
    const assetCode = generateAssetCode(
      state.assets.map((a) => a.assetCode),
      state.settings.assetCodePrefix,
      state.settings.assetCodePadding
    );
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...data,
      id: generateId(),
      assetCode,
      currentValue: data.purchasePrice,
      createdAt: now,
      updatedAt: now,
    };

    // Generate depreciation
    const assetType = state.assetTypes.find((t) => t.id === data.assetTypeId);
    let newDepRecords: DepreciationRecord[] = [];
    if (assetType) {
      newDepRecords = generateDepreciationForAsset(newAsset, assetType);
      if (newDepRecords.length > 0) {
        newAsset.currentValue = getCurrentBookValue(newAsset.id, newDepRecords);
      }
    }

    // Create inventory record
    const invRecord: InventoryRecord = {
      id: generateId(),
      assetId: newAsset.id,
      branchId: data.branchId || state.branches[0]?.id || '',
      quantity: data.quantity || 1,
      minStockLevel: 2,
      maxStockLevel: 15,
      lastAuditDate: now,
    };

    set((s) => ({
      assets: [...s.assets, newAsset],
      depreciationRecords: [...s.depreciationRecords, ...newDepRecords],
      inventoryRecords: [...s.inventoryRecords, invRecord],
    }));

    state.addAuditLog({
      action: 'CREATE',
      entityType: 'Asset',
      entityId: newAsset.id,
      entityName: newAsset.name,
      details: `Asset ${assetCode} created`,
      userName: 'Admin User',
    });

    return newAsset;
  },

  updateAsset: (id, data) => {
    set((s) => ({
      assets: s.assets.map((a) => (a.id === id ? { ...a, ...data, updatedAt: new Date().toISOString() } : a)),
    }));
    const asset = get().assets.find((a) => a.id === id);
    if (asset) {
      get().addAuditLog({
        action: 'UPDATE',
        entityType: 'Asset',
        entityId: id,
        entityName: asset.name,
        details: `Asset updated`,
        userName: 'Admin User',
      });
    }
  },

  deleteAsset: (id) => {
    const asset = get().assets.find((a) => a.id === id);
    set((s) => ({
      assets: s.assets.filter((a) => a.id !== id),
      depreciationRecords: s.depreciationRecords.filter((r) => r.assetId !== id),
      inventoryRecords: s.inventoryRecords.filter((r) => r.assetId !== id),
      maintenanceLogs: s.maintenanceLogs.filter((r) => r.assetId !== id),
      selectedAssetId: s.selectedAssetId === id ? null : s.selectedAssetId,
    }));
    if (asset) {
      get().addAuditLog({
        action: 'DELETE',
        entityType: 'Asset',
        entityId: id,
        entityName: asset.name,
        details: `Asset ${asset.assetCode} deleted`,
        userName: 'Admin User',
      });
    }
  },

  bulkDeleteAssets: (ids) => {
    set((s) => ({
      assets: s.assets.filter((a) => !ids.includes(a.id)),
      depreciationRecords: s.depreciationRecords.filter((r) => !ids.includes(r.assetId)),
      inventoryRecords: s.inventoryRecords.filter((r) => !ids.includes(r.assetId)),
      maintenanceLogs: s.maintenanceLogs.filter((r) => !ids.includes(r.assetId)),
      selectedAssetId: ids.includes(get().selectedAssetId || '') ? null : get().selectedAssetId,
    }));
    get().addAuditLog({
      action: 'DELETE',
      entityType: 'Asset',
      entityName: 'Bulk Delete',
      details: `${ids.length} assets deleted`,
      userName: 'Admin User',
    });
  },

  // Brand CRUD
  addBrand: (data) => {
    const b: Brand = { ...data, id: generateId() };
    set((s) => ({ brands: [...s.brands, b] }));
    get().addAuditLog({ action: 'CREATE', entityType: 'Brand', entityId: b.id, entityName: b.name, details: 'Brand created', userName: 'Admin User' });
    return b;
  },
  updateBrand: (id, data) => set((s) => ({ brands: s.brands.map((b) => (b.id === id ? { ...b, ...data } : b)) })),
  deleteBrand: (id) => set((s) => ({ brands: s.brands.filter((b) => b.id !== id) })),

  // Supplier CRUD
  addSupplier: (data) => {
    const s: Supplier = { ...data, id: generateId() };
    set((st) => ({ suppliers: [...st.suppliers, s] }));
    get().addAuditLog({ action: 'CREATE', entityType: 'Supplier', entityId: s.id, entityName: s.companyName, details: 'Supplier created', userName: 'Admin User' });
    return s;
  },
  updateSupplier: (id, data) => set((s) => ({ suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, ...data } : sup)) })),
  deleteSupplier: (id) => set((s) => ({ suppliers: s.suppliers.filter((sup) => sup.id !== id) })),

  // Branch CRUD
  addBranch: (data) => {
    const b: Branch = { ...data, id: generateId() };
    set((s) => ({ branches: [...s.branches, b] }));
    return b;
  },
  updateBranch: (id, data) => set((s) => ({ branches: s.branches.map((b) => (b.id === id ? { ...b, ...data } : b)) })),
  deleteBranch: (id) => set((s) => ({ branches: s.branches.filter((b) => b.id !== id) })),

  // AssetType CRUD
  addAssetType: (data) => {
    const at: AssetType = { ...data, id: generateId() };
    set((s) => ({ assetTypes: [...s.assetTypes, at] }));
    return at;
  },
  updateAssetType: (id, data) => set((s) => ({ assetTypes: s.assetTypes.map((at) => (at.id === id ? { ...at, ...data } : at)) })),
  deleteAssetType: (id) => set((s) => ({ assetTypes: s.assetTypes.filter((at) => at.id !== id) })),

  // Maintenance
  addMaintenanceLog: (data) => {
    const log: MaintenanceLog = { ...data, id: generateId() };
    set((s) => ({ maintenanceLogs: [...s.maintenanceLogs, log] }));
    get().addAuditLog({ action: 'CREATE', entityType: 'Maintenance', entityId: log.id, entityName: log.description || '', details: 'Maintenance log created', userName: 'Admin User' });
  },
  updateMaintenanceLog: (id, data) => set((s) => ({ maintenanceLogs: s.maintenanceLogs.map((m) => (m.id === id ? { ...m, ...data } : m)) })),
  deleteMaintenanceLog: (id) => set((s) => ({ maintenanceLogs: s.maintenanceLogs.filter((m) => m.id !== id) })),

  // Inventory
  updateInventory: (id, data) => set((s) => ({ inventoryRecords: s.inventoryRecords.map((r) => (r.id === id ? { ...r, ...data } : r)) })),

  // Depreciation
  runDepreciationForAsset: (assetId) => {
    const state = get();
    const asset = state.assets.find((a) => a.id === assetId);
    if (!asset) return;
    const assetType = state.assetTypes.find((t) => t.id === asset.assetTypeId);
    if (!assetType) return;

    // Remove old records
    const filtered = state.depreciationRecords.filter((r) => r.assetId !== assetId);
    const newRecords = generateDepreciationForAsset(asset, assetType);
    const bookValue = newRecords.length > 0 ? getCurrentBookValue(assetId, newRecords) : asset.purchasePrice;

    set({
      depreciationRecords: [...filtered, ...newRecords],
      assets: state.assets.map((a) => (a.id === assetId ? { ...a, currentValue: bookValue } : a)),
    });
  },

  getBookValue: (assetId) => {
    return getCurrentBookValue(assetId, get().depreciationRecords);
  },

  // Roles & Users
  updateRole: (id, data) => set((s) => ({ roles: s.roles.map((r) => (r.id === id ? { ...r, ...data } : r)) })),
  addUser: (data) => {
    const u: User = { ...data, id: generateId() };
    set((s) => ({ users: [...s.users, u] }));
  },
  updateUser: (id, data) => set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, ...data } : u)) })),

  // Import
  addImportJob: (job) => set((s) => ({ importJobs: [...s.importJobs, job] })),

  // Notifications
  addNotification: (data) => {
    const n: Notification = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    set((s) => ({ notifications: [n, ...s.notifications] }));
  },
  markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  // Audit
  addAuditLog: (data) => {
    const log: AuditLog = { ...data, id: generateId(), createdAt: new Date().toISOString() };
    set((s) => ({ auditLogs: [log, ...s.auditLogs] }));
  },

  // Settings
  updateSettings: (data) => set((s) => ({ settings: { ...s.settings, ...data } })),
}));
