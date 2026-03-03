import { Shield, Check, X as XIcon } from 'lucide-react';

const permissions: Record<string, Record<string, string[]>> = {
    ADMIN: {
        Dashboard: ['view'],
        Assets: ['view', 'create', 'edit', 'delete', 'export'],
        Inventory: ['view', 'manage'],
        Maintenance: ['view', 'create', 'edit', 'delete'],
        Depreciation: ['view', 'run'],
        Reports: ['view', 'export'],
        'Asset Types': ['view', 'create', 'edit', 'delete'],
        Brands: ['view', 'create', 'edit', 'delete'],
        Suppliers: ['view', 'create', 'edit', 'delete'],
        Users: ['view', 'create', 'edit', 'delete'],
        Settings: ['view', 'edit'],
        Import: ['upload', 'manage'],
    },
    MANAGER: {
        Dashboard: ['view'],
        Assets: ['view', 'create', 'edit', 'export'],
        Inventory: ['view', 'manage'],
        Maintenance: ['view', 'create', 'edit'],
        Depreciation: ['view'],
        Reports: ['view', 'export'],
        'Asset Types': ['view', 'create', 'edit'],
        Brands: ['view', 'create', 'edit'],
        Suppliers: ['view', 'create', 'edit'],
        Users: ['view'],
        Settings: ['view'],
        Import: ['upload'],
    },
    TECHNICIAN: {
        Dashboard: ['view'],
        Assets: ['view'],
        Maintenance: ['view', 'create', 'edit'],
        Inventory: ['view'],
    },
    VIEWER: {
        Dashboard: ['view'],
        Assets: ['view'],
        Reports: ['view'],
    },
};

const allFeatures = ['Dashboard', 'Assets', 'Inventory', 'Maintenance', 'Depreciation', 'Reports', 'Asset Types', 'Brands', 'Suppliers', 'Users', 'Settings', 'Import'];
const roles = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'VIEWER'];
const roleColors: Record<string, string> = {
    ADMIN: 'from-indigo-500 to-purple-600',
    MANAGER: 'from-emerald-500 to-teal-600',
    TECHNICIAN: 'from-amber-500 to-orange-600',
    VIEWER: 'from-slate-400 to-slate-600',
};

export default function Roles() {
    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Roles & Access Control</h1>
                <p className="text-slate-500 text-sm mt-1">View the permission matrix for all roles</p>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {roles.map(role => {
                    const featureCount = Object.keys(permissions[role] || {}).length;
                    return (
                        <div key={role} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColors[role]} flex items-center justify-center mb-3`}>
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-semibold text-slate-800">{role}</h3>
                            <p className="text-xs text-slate-500 mt-1">{featureCount} features accessible</p>
                        </div>
                    );
                })}
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase sticky left-0 bg-slate-50">Feature</th>
                                {roles.map(r => (
                                    <th key={r} className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">{r}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {allFeatures.map(feature => (
                                <tr key={feature} className="hover:bg-slate-50">
                                    <td className="px-5 py-3 text-sm font-medium text-slate-700 sticky left-0 bg-white">{feature}</td>
                                    {roles.map(role => {
                                        const perms = permissions[role]?.[feature];
                                        return (
                                            <td key={role} className="px-5 py-3 text-center">
                                                {perms ? (
                                                    <div className="flex items-center justify-center gap-1 flex-wrap">
                                                        {perms.map(p => (
                                                            <span key={p} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium">{p}</span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <XIcon className="w-4 h-4 text-slate-300 mx-auto" />
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
