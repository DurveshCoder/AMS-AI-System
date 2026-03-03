import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Tags, Pencil, Trash2, X } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function AssetTypes() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ name: '', description: '', depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 5, salvageValuePercent: 10 });

    const { data, isLoading } = useQuery({
        queryKey: ['asset-types'],
        queryFn: () => api.get('/asset-types').then(r => r.data.data)
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) => editing ? api.put(`/asset-types/${editing.id}`, data) : api.post('/asset-types', data),
        onSuccess: () => { toast.success('Saved!'); queryClient.invalidateQueries({ queryKey: ['asset-types'] }); setShowForm(false); setEditing(null); },
        onError: () => toast.error('Save failed')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/asset-types/${id}`),
        onSuccess: () => { toast.success('Deleted!'); queryClient.invalidateQueries({ queryKey: ['asset-types'] }); },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Delete failed')
    });

    const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name, description: t.description || '', depreciationMethod: t.depreciationMethod, usefulLifeYears: t.usefulLifeYears, salvageValuePercent: t.salvageValuePercent }); setShowForm(true); };
    const openNew = () => { setEditing(null); setForm({ name: '', description: '', depreciationMethod: 'STRAIGHT_LINE', usefulLifeYears: 5, salvageValuePercent: 10 }); setShowForm(true); };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-900">Asset Types</h1><p className="text-slate-500 text-sm">Configure depreciation methods and useful life</p></div>
                <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 shadow-md">
                    <Plus className="w-4 h-4" /> Add Type
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border animate-pulse h-32"></div>
                )) : (data || []).map((t: any) => (
                    <div key={t.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                                <Tags className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-slate-100"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                                <button onClick={() => deleteMutation.mutate(t.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                            </div>
                        </div>
                        <h3 className="font-semibold text-slate-800">{t.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 mb-3">{t.description || 'No description'}</p>
                        <div className="flex gap-3 text-xs">
                            <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full font-medium">
                                {t.depreciationMethod === 'STRAIGHT_LINE' ? 'SLM' : 'WDV'}
                            </span>
                            <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-full">{t.usefulLifeYears}yr</span>
                            <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-full">{t.salvageValuePercent}% salvage</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-3">{t._count?.assets || 0} assets</p>
                    </div>
                ))}
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in mx-4">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Asset Type</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Depreciation Method</label>
                                <select value={form.depreciationMethod} onChange={e => setForm({ ...form, depreciationMethod: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm">
                                    <option value="STRAIGHT_LINE">Straight Line (SLM)</option><option value="DECLINING_BALANCE">Written Down Value (WDV)</option>
                                </select></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Useful Life (years)</label>
                                    <input type="number" value={form.usefulLifeYears} onChange={e => setForm({ ...form, usefulLifeYears: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                                <div><label className="block text-sm font-medium text-slate-700 mb-1">Salvage Value %</label>
                                    <input type="number" value={form.salvageValuePercent} onChange={e => setForm({ ...form, salvageValuePercent: parseInt(e.target.value) })} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" /></div>
                            </div>
                            <button type="submit" disabled={saveMutation.isPending}
                                className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-sm">
                                {saveMutation.isPending ? 'Saving...' : 'Save'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
