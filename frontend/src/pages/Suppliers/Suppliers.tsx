import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Truck, Mail, Phone, Pencil, Trash2, X } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Suppliers() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ companyName: '', contactPerson: '', email: '', phone: '', address: '', city: '', pincode: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: () => api.get('/suppliers').then(r => r.data.data)
    });

    const saveMutation = useMutation({
        mutationFn: (data: any) => editing ? api.put(`/suppliers/${editing.id}`, data) : api.post('/suppliers', data),
        onSuccess: () => { toast.success('Saved!'); queryClient.invalidateQueries({ queryKey: ['suppliers'] }); setShowForm(false); setEditing(null); },
        onError: () => toast.error('Save failed')
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.delete(`/suppliers/${id}`),
        onSuccess: () => { toast.success('Deleted!'); queryClient.invalidateQueries({ queryKey: ['suppliers'] }); },
        onError: (e: any) => toast.error(e.response?.data?.error || 'Delete failed')
    });

    const openEdit = (s: any) => {
        setEditing(s);
        setForm({ companyName: s.companyName, contactPerson: s.contactPerson || '', email: s.email || '', phone: s.phone || '', address: s.address || '', city: s.city || '', pincode: s.pincode || '' });
        setShowForm(true);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div><h1 className="text-2xl font-bold text-slate-900">Suppliers</h1><p className="text-slate-500 text-sm">Manage asset suppliers and vendors</p></div>
                <button onClick={() => { setEditing(null); setForm({ companyName: '', contactPerson: '', email: '', phone: '', address: '', city: '', pincode: '' }); setShowForm(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:opacity-90 shadow-md">
                    <Plus className="w-4 h-4" /> Add Supplier
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Company</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Contact</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Email</th>
                            <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">City</th>
                            <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Assets</th>
                            <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {isLoading ? Array.from({ length: 5 }).map((_, i) => (
                            <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse"></div></td></tr>
                        )) : (data || []).map((s: any) => (
                            <tr key={s.id} className="hover:bg-slate-50">
                                <td className="px-5 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                            <Truck className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-800">{s.companyName}</span>
                                    </div>
                                </td>
                                <td className="px-5 py-3 text-sm text-slate-600">{s.contactPerson || '—'}</td>
                                <td className="px-5 py-3 text-sm text-slate-600">{s.email || '—'}</td>
                                <td className="px-5 py-3 text-sm text-slate-600">{s.city || '—'}</td>
                                <td className="px-5 py-3 text-center">
                                    <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">{s._count?.assets || 0}</span>
                                </td>
                                <td className="px-5 py-3 text-right">
                                    <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg hover:bg-slate-100 mr-1"><Pencil className="w-3.5 h-3.5 text-slate-400" /></button>
                                    <button onClick={() => deleteMutation.mutate(s.id)} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-fade-in mx-4">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{editing ? 'Edit' : 'New'} Supplier</h2>
                            <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                            <div><label className="block text-sm font-medium mb-1">Company Name</label>
                                <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} required className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">Contact Person</label>
                                    <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                                <div><label className="block text-sm font-medium mb-1">Phone</label>
                                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                            </div>
                            <div><label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div><label className="block text-sm font-medium mb-1">City</label>
                                    <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                                <div><label className="block text-sm font-medium mb-1">Pincode</label>
                                    <input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" /></div>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium text-sm">Save</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
