import { useState } from 'react';
import { FileText, Download, Loader2, BarChart2, Package, Wrench, TrendingDown, Boxes, Users, Truck, Award, MapPin, Shield, Upload, History } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const reportTypes = [
    { key: 'asset-register', label: 'Asset Register', desc: 'Complete list of all assets', icon: Package, color: 'from-indigo-500 to-blue-600' },
    { key: 'asset-valuation', label: 'Asset Valuation', desc: 'Current values of all assets', icon: BarChart2, color: 'from-emerald-500 to-teal-600' },
    { key: 'depreciation-schedule', label: 'Depreciation Schedule', desc: 'Depreciation details per asset', icon: TrendingDown, color: 'from-rose-500 to-pink-600' },
    { key: 'maintenance-history', label: 'Maintenance History', desc: 'All maintenance records', icon: Wrench, color: 'from-amber-500 to-orange-600' },
    { key: 'inventory-stock', label: 'Inventory Stock', desc: 'Stock levels at all branches', icon: Boxes, color: 'from-cyan-500 to-blue-600' },
    { key: 'asset-by-supplier', label: 'Assets by Supplier', desc: 'Grouped by supplier', icon: Truck, color: 'from-purple-500 to-violet-600' },
    { key: 'asset-by-brand', label: 'Assets by Brand', desc: 'Grouped by brand', icon: Award, color: 'from-pink-500 to-rose-600' },
    { key: 'asset-by-branch', label: 'Assets by Location', desc: 'Grouped by branch', icon: MapPin, color: 'from-teal-500 to-emerald-600' },
    { key: 'fully-depreciated', label: 'Fully Depreciated', desc: 'Assets with zero book value', icon: TrendingDown, color: 'from-red-500 to-rose-600' },
    { key: 'warranty-expiry', label: 'Warranty Expiry', desc: 'Upcoming warranty expirations', icon: Shield, color: 'from-orange-500 to-amber-600' },
    { key: 'audit-trail', label: 'Audit Trail', desc: 'User activity logs', icon: Users, color: 'from-slate-500 to-gray-600' },
    { key: 'import-history', label: 'Import History', desc: 'Past import records', icon: Upload, color: 'from-blue-500 to-indigo-600' },
];

export default function Reports() {
    const [downloading, setDownloading] = useState<string | null>(null);

    const handleDownload = async (type: string) => {
        setDownloading(type);
        try {
            const res = await api.get(`/reports/${type}`, { params: { format: 'excel' }, responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${type}-report.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success('Report downloaded!');
        } catch {
            toast.error('Download failed');
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
                <p className="text-slate-500 text-sm mt-1">Generate and download reports in Excel format</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {reportTypes.map((r) => (
                    <div key={r.key} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover group">
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                            <r.icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-800 mb-1">{r.label}</h3>
                        <p className="text-xs text-slate-500 mb-4">{r.desc}</p>
                        <button
                            onClick={() => handleDownload(r.key)}
                            disabled={downloading === r.key}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all disabled:opacity-50"
                        >
                            {downloading === r.key ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            Download Excel
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
