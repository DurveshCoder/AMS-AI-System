import { useQuery } from '@tanstack/react-query';
import { Boxes, AlertTriangle, Package, Search } from 'lucide-react';
import api from '../../api/client';
import { useState } from 'react';

export default function Inventory() {
    const [search, setSearch] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['inventory'],
        queryFn: () => api.get('/inventory').then(r => r.data)
    });

    const records = data?.data || [];
    const summary = data?.summary || {};
    const filtered = records.filter((r: any) =>
        !search || r.asset?.name?.toLowerCase().includes(search.toLowerCase()) || r.asset?.assetCode?.toLowerCase().includes(search.toLowerCase())
    );

    const summaryCards = [
        { label: 'Total SKUs', value: summary.totalSkus || 0, icon: Package, color: 'from-indigo-500 to-blue-600' },
        { label: 'Total Stock', value: summary.totalStockValue || 0, icon: Boxes, color: 'from-emerald-500 to-teal-600' },
        { label: 'Low Stock', value: summary.lowStock || 0, icon: AlertTriangle, color: 'from-amber-500 to-orange-600' },
        { label: 'Out of Stock', value: summary.outOfStock || 0, icon: AlertTriangle, color: 'from-red-500 to-rose-600' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>
                <p className="text-slate-500 text-sm mt-1">Track stock levels across locations</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500">{c.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{c.value}</p>
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}>
                                <c.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="relative w-72">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Search inventory..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asset</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Branch</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Qty</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Min</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Max</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Last Audit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                        )) : filtered.map((r: any) => {
                            const isLow = r.quantity <= r.minStockLevel;
                            const isOut = r.quantity === 0;
                            return (
                                <tr key={r.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3">
                                        <p className="text-sm font-medium text-slate-800">{r.asset?.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{r.asset?.assetCode}</p>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-slate-600">{r.branch?.name}</td>
                                    <td className={`px-5 py-3 text-center text-sm font-semibold ${isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'}`}>{r.quantity}</td>
                                    <td className="px-5 py-3 text-center text-sm text-slate-500">{r.minStockLevel}</td>
                                    <td className="px-5 py-3 text-center text-sm text-slate-500">{r.maxStockLevel}</td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${isOut ? 'bg-red-100 text-red-700' : isLow ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-slate-500">
                                        {r.lastAuditDate ? new Date(r.lastAuditDate).toLocaleDateString('en-IN') : '—'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
