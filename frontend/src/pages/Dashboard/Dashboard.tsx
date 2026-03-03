import { useQuery } from '@tanstack/react-query';
import { Package, DollarSign, Wrench, AlertTriangle, TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import api from '../../api/client';

const COLORS = ['#6366F1', '#8B5CF6', '#A78BFA', '#C4B5FD', '#818CF8', '#4F46E5', '#7C3AED', '#5B21B6'];

export default function Dashboard() {
    const { data: stats } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: () => api.get('/dashboard/stats').then(r => r.data.data)
    });

    const { data: chartsRaw } = useQuery({
        queryKey: ['dashboard-charts'],
        queryFn: () => api.get('/dashboard/charts').then(r => r.data.data)
    });

    const charts = chartsRaw || {};
    const byStatus = charts.assetsByStatus || charts.byStatus || [];
    const byBranch = charts.assetsByBranch || charts.byBranch || [];
    const byType = charts.assetsByType || charts.byType || [];
    const valueTrend = charts.assetValueOverTime || charts.valueTrend || [];

    const kpis = [
        { label: 'Total Assets', value: stats?.totalAssets || 0, icon: Package, color: 'from-indigo-500 to-blue-600', change: '+12', up: true },
        { label: 'Total Value', value: `₹${((stats?.totalValue || 0) / 100000).toFixed(1)}L`, icon: DollarSign, color: 'from-emerald-500 to-teal-600', change: '+8%', up: true },
        { label: 'Under Maintenance', value: stats?.underMaintenance || 0, icon: Wrench, color: 'from-amber-500 to-orange-600', change: '-2', up: false },
        { label: 'Warranty Expiring', value: stats?.warrantyExpiring || 0, icon: AlertTriangle, color: 'from-rose-500 to-pink-600', change: '+5', up: true },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 text-sm mt-1">Welcome back! Here's your asset overview</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 card-hover">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${kpi.up ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {kpi.change} from last month
                                </div>
                            </div>
                            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                                <kpi.icon className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Assets by Status */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Assets by Status</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={byStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {(charts?.byStatus || []).map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-4 flex-wrap mt-2">
                        {byStatus.map((s: any, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                                <span className="text-slate-600">{s.status} ({s.count})</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Assets by Branch */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-800">Assets by Location</h3>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byBranch} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366F1" />
                                        <stop offset="100%" stopColor="#8B5CF6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Assets by Type */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Assets by Type</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={byType} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                                    {byType.map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Value Trend */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Asset Value Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={valueTrend.length ? valueTrend : [{ month: 'Jan', value: stats?.totalValue || 0 }]}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
                                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Value']} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#6366F1" fill="url(#areaGradient)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
