import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings as SettingsIcon, Building2, Globe, Calendar, Hash, Save, Loader2 } from 'lucide-react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function Settings() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: '', address: '', currency: 'INR', dateFormat: 'DD/MM/YYYY', fiscalYearStart: 4, assetCodePrefix: 'AST', assetCodePadding: 5, warrantyAlertDays: 30, lowStockThreshold: 5 });

    const { data, isLoading } = useQuery({
        queryKey: ['settings'],
        queryFn: () => api.get('/settings').then(r => r.data.data)
    });

    useEffect(() => {
        if (data) {
            setForm({
                name: data.name || '',
                address: data.address || '',
                currency: data.settings?.currency || 'INR',
                dateFormat: data.settings?.dateFormat || 'DD/MM/YYYY',
                fiscalYearStart: data.settings?.fiscalYearStart || 4,
                assetCodePrefix: data.settings?.assetCodePrefix || 'AST',
                assetCodePadding: data.settings?.assetCodePadding || 5,
                warrantyAlertDays: data.settings?.warrantyAlertDays || 30,
                lowStockThreshold: data.settings?.lowStockThreshold || 5,
            });
        }
    }, [data]);

    const saveMutation = useMutation({
        mutationFn: () => api.put('/settings', {
            name: form.name,
            address: form.address,
            settings: {
                currency: form.currency,
                dateFormat: form.dateFormat,
                fiscalYearStart: form.fiscalYearStart,
                assetCodePrefix: form.assetCodePrefix,
                assetCodePadding: form.assetCodePadding,
                warrantyAlertDays: form.warrantyAlertDays,
                lowStockThreshold: form.lowStockThreshold,
            }
        }),
        onSuccess: () => { toast.success('Settings saved!'); queryClient.invalidateQueries({ queryKey: ['settings'] }); },
        onError: () => toast.error('Save failed')
    });

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Configure your organization preferences</p>
            </div>

            {/* Organization */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Organization</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Organization Name</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" rows={2} />
                    </div>
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <Globe className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Preferences</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Currency</label>
                        <select value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                            <option value="INR">INR (₹)</option><option value="USD">USD ($)</option><option value="EUR">EUR (€)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Date Format</label>
                        <select value={form.dateFormat} onChange={e => setForm({ ...form, dateFormat: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                            <option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Fiscal Year Start Month</label>
                        <select value={form.fiscalYearStart} onChange={e => setForm({ ...form, fiscalYearStart: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm">
                            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                                <option key={i} value={i + 1}>{m}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Asset Code */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <Hash className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Asset Code Format</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Prefix</label>
                        <input value={form.assetCodePrefix} onChange={e => setForm({ ...form, assetCodePrefix: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Number Padding</label>
                        <input type="number" value={form.assetCodePadding} onChange={e => setForm({ ...form, assetCodePadding: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" />
                    </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Preview: {form.assetCodePrefix}-{String(1).padStart(form.assetCodePadding, '0')}</p>
            </div>

            {/* Alerts */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-5">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-semibold text-slate-800">Alerts & Thresholds</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Warranty Alert (days before)</label>
                        <input type="number" value={form.warrantyAlertDays} onChange={e => setForm({ ...form, warrantyAlertDays: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Low Stock Threshold</label>
                        <input type="number" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: parseInt(e.target.value) })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/30 focus:outline-none" />
                    </div>
                </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium text-sm hover:opacity-90 shadow-md disabled:opacity-50">
                    {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Settings
                </button>
            </div>
        </div>
    );
}
