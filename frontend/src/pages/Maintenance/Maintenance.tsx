import { useQuery } from '@tanstack/react-query';
import { Wrench, Clock, CheckCircle, AlertTriangle, Search } from 'lucide-react';
import api from '../../api/client';
import { useState } from 'react';

const typeColors: Record<string, string> = {
    PREVENTIVE: 'bg-blue-100 text-blue-700',
    CORRECTIVE: 'bg-amber-100 text-amber-700',
    EMERGENCY: 'bg-red-100 text-red-700',
};

const statusIcons: Record<string, any> = {
    PENDING: { icon: Clock, color: 'text-amber-500' },
    IN_PROGRESS: { icon: Wrench, color: 'text-blue-500' },
    COMPLETED: { icon: CheckCircle, color: 'text-emerald-500' },
};

export default function Maintenance() {
    const [filter, setFilter] = useState('');

    const { data, isLoading } = useQuery({
        queryKey: ['maintenance', filter],
        queryFn: () => api.get('/maintenance', { params: { status: filter || undefined } }).then(r => r.data)
    });

    const logs = data?.data || [];
    const counts = {
        all: logs.length,
        pending: logs.filter((l: any) => l.status === 'PENDING').length,
        inProgress: logs.filter((l: any) => l.status === 'IN_PROGRESS').length,
        completed: logs.filter((l: any) => l.status === 'COMPLETED').length,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Maintenance</h1>
                <p className="text-slate-500 text-sm mt-1">Track and manage asset maintenance</p>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: counts.all, icon: Wrench, color: 'from-indigo-500 to-blue-600' },
                    { label: 'Pending', value: counts.pending, icon: Clock, color: 'from-amber-500 to-orange-600' },
                    { label: 'In Progress', value: counts.inProgress, icon: AlertTriangle, color: 'from-blue-500 to-cyan-600' },
                    { label: 'Completed', value: counts.completed, icon: CheckCircle, color: 'from-emerald-500 to-teal-600' },
                ].map((c, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <div className="flex items-start justify-between">
                            <div><p className="text-sm text-slate-500">{c.label}</p><p className="text-2xl font-bold mt-1">{c.value}</p></div>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.color} flex items-center justify-center`}><c.icon className="w-5 h-5 text-white" /></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex gap-2">
                {['', 'PENDING', 'IN_PROGRESS', 'COMPLETED'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                        {f || 'All'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Asset</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Type</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Scheduled</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Technician</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Cost</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                        )) : logs.map((log: any) => {
                            const si = statusIcons[log.status] || statusIcons.PENDING;
                            return (
                                <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="px-5 py-3">
                                        <p className="text-sm font-medium text-slate-800">{log.asset?.name}</p>
                                        <p className="text-xs text-slate-400 font-mono">{log.asset?.assetCode}</p>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[log.type] || 'bg-slate-100 text-slate-600'}`}>{log.type}</span>
                                    </td>
                                    <td className="px-5 py-3 text-sm text-slate-600 max-w-[200px] truncate">{log.description}</td>
                                    <td className="px-5 py-3 text-sm text-slate-600">{new Date(log.scheduledDate).toLocaleDateString('en-IN')}</td>
                                    <td className="px-5 py-3 text-sm text-slate-600">{log.technician?.name || '—'}</td>
                                    <td className="px-5 py-3 text-sm font-medium text-slate-800 text-right">₹{log.cost.toLocaleString()}</td>
                                    <td className="px-5 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <si.icon className={`w-4 h-4 ${si.color}`} />
                                            <span className="text-sm text-slate-600">{log.status.replace('_', ' ')}</span>
                                        </div>
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
