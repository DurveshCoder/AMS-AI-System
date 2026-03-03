import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Package, Calendar, MapPin, Wrench, TrendingDown, FileText, User, Tag, Shield } from 'lucide-react';
import api from '../../api/client';

export default function AssetDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: asset, isLoading } = useQuery({
        queryKey: ['asset', id],
        queryFn: () => api.get(`/assets/${id}`).then(r => r.data.data)
    });

    const { data: depreciation } = useQuery({
        queryKey: ['asset-depreciation', id],
        queryFn: () => api.get(`/depreciation/${id}/schedule`).then(r => r.data.data),
        enabled: !!id
    });

    if (isLoading) return (
        <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!asset) return <div className="text-center py-8 text-slate-500">Asset not found</div>;

    const depPercent = asset.purchasePrice > 0
        ? Math.min(100, ((asset.purchasePrice - asset.currentValue) / asset.purchasePrice) * 100)
        : 0;

    const statusColors: Record<string, string> = {
        ACTIVE: 'bg-emerald-100 text-emerald-700',
        INACTIVE: 'bg-slate-100 text-slate-600',
        UNDER_MAINTENANCE: 'bg-amber-100 text-amber-700',
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/assets')} className="p-2 rounded-lg hover:bg-slate-100"><ArrowLeft className="w-5 h-5" /></button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900">{asset.name}</h1>
                    <p className="text-slate-500 text-sm font-mono">{asset.assetCode}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusColors[asset.status] || 'bg-slate-100'}`}>
                    {asset.status.replace('_', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Details Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><Package className="w-5 h-5 text-indigo-600" /> Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Serial Number', value: asset.serialNumber || '—' },
                                { label: 'Brand', value: asset.brand?.name || '—' },
                                { label: 'Type', value: asset.assetType?.name || '—' },
                                { label: 'Supplier', value: asset.supplier?.companyName || '—' },
                                { label: 'Purchase Date', value: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('en-IN') : '—' },
                                { label: 'Warranty Until', value: asset.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate).toLocaleDateString('en-IN') : '—' },
                                { label: 'Location', value: asset.branch?.name || '—' },
                                { label: 'Assigned To', value: asset.assignedTo?.name || '—' },
                            ].map((item, i) => (
                                <div key={i} className="py-2">
                                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                                    <p className="text-sm font-medium text-slate-800">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Depreciation Schedule */}
                    {depreciation?.schedules && depreciation.schedules.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2"><TrendingDown className="w-5 h-5 text-indigo-600" /> Depreciation Schedule</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Period</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Opening</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Depreciation</th>
                                            <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Closing</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {depreciation.schedules.slice(-12).map((s: any, i: number) => (
                                            <tr key={i} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 text-slate-700">{s.year}-{String(s.month).padStart(2, '0')}</td>
                                                <td className="px-3 py-2 text-right text-slate-600">₹{s.openingValue.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right text-red-600">-₹{s.depreciationAmount.toLocaleString()}</td>
                                                <td className="px-3 py-2 text-right font-medium text-slate-800">₹{s.closingValue.toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Side Panel */}
                <div className="space-y-5">
                    {/* Valuation Card */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/25">
                        <h3 className="text-sm font-medium text-indigo-100 mb-3">Current Valuation</h3>
                        <p className="text-3xl font-bold">₹{asset.currentValue.toLocaleString()}</p>
                        <p className="text-sm text-indigo-200 mt-1">Purchase: ₹{asset.purchasePrice.toLocaleString()}</p>
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-indigo-200 mb-1">
                                <span>Depreciation</span>
                                <span>{depPercent.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                                <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${depPercent}%` }}></div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3">
                        {[
                            { icon: Calendar, label: 'Purchase Date', value: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString('en-IN') : '—' },
                            { icon: MapPin, label: 'Branch', value: asset.branch?.name || '—' },
                            { icon: User, label: 'Assigned To', value: asset.assignedTo?.name || 'Unassigned' },
                            { icon: Tag, label: 'Asset Type', value: asset.assetType?.name || '—' },
                            { icon: Shield, label: 'Warranty', value: asset.warrantyExpiryDate ? new Date(asset.warrantyExpiryDate).toLocaleDateString('en-IN') : '—' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                                <item.icon className="w-4 h-4 text-slate-400" />
                                <div>
                                    <p className="text-xs text-slate-400">{item.label}</p>
                                    <p className="text-sm font-medium text-slate-700">{item.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
