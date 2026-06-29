import { useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
    BarChart3, Download, TrendingUp, Users, Calendar,
    Activity, ArrowRight, FileText, FileSpreadsheet, Printer,
    FileStack, Clock, LayoutTemplate, HardDrive, Filter, RotateCcw,
    Building2, MapPin, FileDown, Table as TableIcon, FileDigit
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar,
    PieChart as RePieChart, Pie, Cell
} from "recharts";

const MONTHLY_DATA = [
    { name: "Jan", sales: 4000, revenue: 2400 },
    { name: "Feb", sales: 3000, revenue: 1398 },
    { name: "Mar", sales: 2000, revenue: 9800 },
    { name: "Apr", sales: 2780, revenue: 3908 },
    { name: "May", sales: 1890, revenue: 4800 },
    { name: "Jun", sales: 2390, revenue: 3800 },
];

const SOURCE_DATA = [
    { name: "Website", value: 400 },
    { name: "Referral", value: 300 },
    { name: "Social Media", value: 300 },
    { name: "Direct", value: 200 },
];
const COLORS = ["#F4B400", "#171C2D", "#22C55E", "#3B82F6"];

const KPI_CARDS = [
    { label: "Total Revenue", value: "$1.2M", icon: TrendingUp, change: "+12.5%" },
    { label: "Conversions", value: "24.8%", icon: Activity, change: "+4.1%" },
    { label: "Active Employees", value: "14", icon: Users, change: "Stable" },
];

const ReportsTemplate = ({ title, subtitle, children }) => (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-black text-[#0F172A] tracking-tight">{title}</h2>
            {subtitle && <p className="text-slate-500 font-medium mt-1">{subtitle}</p>}
        </div>
        {children}
    </div>
);

// --- Sub Pages ---

const DashboardAnalytics = () => (
    <ReportsTemplate title="Dashboard Analytics" subtitle="High-level metrics and global performance trends.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
            {KPI_CARDS.map((kpi, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-[#171C2D] text-[#F4B400] rounded-xl"><kpi.icon size={22} /></div>
                    <div>
                        <p className="text-sm font-semibold text-slate-500 mb-1">{kpi.label}</p>
                        <h4 className="text-2xl font-black text-[#0F172A] leading-none mb-1">{kpi.value}</h4>
                        <p className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 inline-block px-2 py-0.5 rounded-md">{kpi.change}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <h3 className="text-base font-bold text-[#0F172A] mb-6">Revenue Overview</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F4B400" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F4B400" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                            <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="revenue" stroke="#F4B400" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                <h3 className="text-base font-bold text-[#0F172A] mb-6">Lead Sources</h3>
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                            <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {SOURCE_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </RePieChart>
                    </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {SOURCE_DATA.map((entry, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                            {entry.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </ReportsTemplate>
);

const SalesReports = () => (
    <ReportsTemplate title="Sales Reports" subtitle="Analyze closing metrics and overall sales throughput.">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm mb-6 mt-4">
            <h3 className="text-base font-bold text-[#0F172A] mb-6">Monthly Sales Volume</h3>
            <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#F1F5F9' }} />
                        <Bar dataKey="sales" fill="#171C2D" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    </ReportsTemplate>
);

const EmployeePerformance = () => (
    <ReportsTemplate title="Employee Performance" subtitle="Track staff conversion metrics and task execution.">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mt-4">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#0F172A]">Top Performing Employees</h3>
                <span className="text-xs font-bold text-[#F4B400] bg-[#F4B400]/10 px-3 py-1 rounded-full uppercase tracking-wider">This Month</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4">Employee</th>
                            <th className="px-6 py-4">Leads Assigned</th>
                            <th className="px-6 py-4">Site Visits</th>
                            <th className="px-6 py-4">Deals Closed</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {[
                            { name: "Aarthi D", role: "Sr. Agent", leads: 45, visits: 12, deals: 4 },
                            { name: "John Doe", role: "Agent", leads: 32, visits: 8, deals: 2 },
                            { name: "Mike Smith", role: "Field Exec", leads: 28, visits: 15, deals: 3 },
                        ].map((emp, i) => (
                            <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#171C2D] text-white flex items-center justify-center text-xs font-bold">{emp.name.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-[#0F172A]">{emp.name}</p>
                                            <p className="text-xs text-slate-400 font-medium">{emp.role}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-semibold text-slate-600">{emp.leads}</td>
                                <td className="px-6 py-4 font-semibold text-slate-600">{emp.visits}</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-[#22C55E]/10 text-[#22C55E] font-bold rounded-lg pointer-events-none">
                                        {emp.deals}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </ReportsTemplate>
);

const ExportReports = () => {
    const [selectedType, setSelectedType] = useState('Sales Report');
    const [selectedFormat, setSelectedFormat] = useState('CSV');
    const [filters, setFilters] = useState({ dateRange: 'This Month', employee: 'All', status: 'All' });

    const reportTypes = [
        { id: 'Sales Report', icon: TrendingUp, desc: 'Revenue & closing metrics' },
        { id: 'Lead Report', icon: Users, desc: 'Lead pipeline & sources' },
        { id: 'Employee Performance', icon: Activity, desc: 'Staff ranking & efficiency' },
        { id: 'Property Report', icon: Building2, desc: 'Inventory & availability' },
        { id: 'Site Visit Report', icon: MapPin, desc: 'Scheduled & completed tours' },
    ];

    const formats = [
        { id: 'PDF', icon: FileText, desc: 'Best for printing' },
        { id: 'Excel', icon: FileSpreadsheet, desc: 'Advanced analysis' },
        { id: 'CSV', icon: TableIcon, desc: 'Raw data import' },
        { id: 'Print', icon: Printer, desc: 'Direct to paper' },
    ];

    const quickTemplates = ['Today\'s Sales', 'Weekly Performance', 'Monthly Revenue', 'Employee Summary', 'Lead Analytics'];

    const handleExport = () => {
        if (selectedFormat === 'CSV') {
            const csvContent = "data:text/csv;charset=utf-8,Date,Type,Revenue,Status\n2026-06-01,Sale,120000,Closed\n2026-06-05,Sale,85000,Closed";
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `smart_crm_${selectedType.replace(' ', '_').toLowerCase()}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert(`Initiating generation for ${selectedFormat} export: ${selectedType}...`);
        }
    };

    return (
        <ReportsTemplate title="Export Reports" subtitle="Generate and download business reports in multiple formats.">

            {/* Top Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-8">
                {[
                    { label: "Total Reports Generated", value: "1,284", icon: FileStack, color: "text-blue-500" },
                    { label: "Last Export Date", value: "2 Hrs Ago", icon: Clock, color: "text-orange-500" },
                    { label: "Available Templates", value: "24", icon: LayoutTemplate, color: "text-[#22C55E]" },
                    { label: "Storage Used", value: "4.2 GB", icon: HardDrive, color: "text-[#F4B400]" },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200/60 shadow-sm flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                        <div className={`p-3 bg-slate-50 rounded-xl border border-slate-100 ${stat.color}`}>
                            <stat.icon size={22} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                            <h4 className="text-xl font-black text-[#0F172A] leading-none">{stat.value}</h4>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Configuration Area */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Report Type Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <h3 className="text-lg font-black text-[#0F172A] mb-4">Select Report Type</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {reportTypes.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer flex items-start gap-4 transition-all duration-200 ${selectedType === type.id ? 'border-[#F4B400] bg-[#F4B400]/5 shadow-sm' : 'border-slate-100 hover:border-slate-300 bg-slate-50/50'}`}
                                >
                                    <div className={`p-2 rounded-lg shrink-0 ${selectedType === type.id ? 'bg-[#171C2D] text-[#F4B400]' : 'bg-white border border-slate-200 text-slate-500'}`}>
                                        <type.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className={`font-bold ${selectedType === type.id ? 'text-[#171C2D]' : 'text-[#0F172A]'}`}>{type.id}</h4>
                                        <p className="text-xs font-medium text-slate-500 mt-0.5">{type.desc}</p>
                                    </div>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedType === type.id ? 'border-[#F4B400] bg-[#F4B400]' : 'border-slate-300 bg-white'}`}>
                                        {selectedType === type.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-[#0F172A]">Filter Settings</h3>
                            <button className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors">
                                <RotateCcw size={12} /> Reset Filters
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Range</label>
                                <select className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F4B400] transition-colors">
                                    <option>This Month (June)</option>
                                    <option>Last 30 Days</option>
                                    <option>This Quarter</option>
                                    <option>Year to Date</option>
                                    <option>Custom Range...</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee</label>
                                <select className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F4B400] transition-colors">
                                    <option>All Employees</option>
                                    <option>Aarthi D (Sr. Agent)</option>
                                    <option>John Doe</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Property Region</label>
                                <select className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F4B400] transition-colors">
                                    <option>All Regions</option>
                                    <option>North District</option>
                                    <option>Downtown Central</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Lead Status</label>
                                <select className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F4B400] transition-colors">
                                    <option>Any Status</option>
                                    <option>Closed Won</option>
                                    <option>In Negotiation</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-5 flex justify-end">
                            <button className="bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold py-2.5 px-6 rounded-xl text-sm transition-colors flex items-center gap-2">
                                <Filter size={16} /> Apply Filters
                            </button>
                        </div>
                    </div>

                    {/* Export Format */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <h3 className="text-lg font-black text-[#0F172A] mb-4">Export Format</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {formats.map(fmt => (
                                <div
                                    key={fmt.id}
                                    onClick={() => setSelectedFormat(fmt.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer flex flex-col items-center text-center transition-all duration-200 ${selectedFormat === fmt.id ? 'border-[#171C2D] bg-[#171C2D] text-white shadow-lg' : 'border-slate-100 hover:border-slate-300 bg-slate-50 hover:bg-white text-slate-500'}`}
                                >
                                    <fmt.icon size={28} className={`mb-3 ${selectedFormat === fmt.id ? 'text-[#F4B400]' : 'text-slate-400'}`} />
                                    <h4 className={`font-bold text-sm mb-1 ${selectedFormat === fmt.id ? 'text-white' : 'text-[#0F172A]'}`}>{fmt.id}</h4>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${selectedFormat === fmt.id ? 'text-slate-300' : 'text-slate-400'}`}>{fmt.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Sidebar Sticky Area */}
                <div className="lg:col-span-4 space-y-6 relative">
                    <div className="sticky top-24 space-y-6">

                        {/* Preview & Summary Section */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="p-2 bg-[#F4B400]/10 text-[#F4B400] rounded-lg"><FileDigit size={20} /></div>
                                <div>
                                    <h3 className="text-base font-black text-[#0F172A] leading-tight">Export Summary</h3>
                                    <p className="text-xs font-semibold text-slate-400">Review before generation</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">Report Name:</span>
                                    <span className="font-bold text-[#0F172A]">{selectedType}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">Selected Format:</span>
                                    <span className="font-bold text-[#0F172A] bg-slate-100 px-2 py-0.5 rounded">{selectedFormat}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">Date Range:</span>
                                    <span className="font-bold text-[#0F172A]">{filters.dateRange}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">Records Count:</span>
                                    <span className="font-bold text-[#22C55E]">~4,120</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">Estimated Size:</span>
                                    <span className="font-bold text-[#0F172A]">2.4 MB</span>
                                </div>
                            </div>

                            {/* Primary Action Button */}
                            <button
                                onClick={handleExport}
                                className="w-full bg-[#171C2D] text-white hover:bg-[#F4B400] hover:text-[#171C2D] hover:shadow-lg shadow-md transition-all duration-300 font-bold py-4 rounded-xl flex items-center justify-center gap-3 group text-lg"
                            >
                                <Download size={22} className="transition-transform group-hover:-translate-y-1" />
                                Generate & Export
                            </button>
                        </div>

                        {/* Quick Export Templates */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                            <h3 className="text-sm font-black text-[#0F172A] mb-4 uppercase tracking-wider text-slate-500">Quick Templates</h3>
                            <div className="flex flex-wrap gap-2">
                                {quickTemplates.map((temp, i) => (
                                    <span key={i} className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-[#171C2D] hover:text-[#F4B400] cursor-pointer px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-[#171C2D]">
                                        {temp}
                                    </span>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Recent Exports Table */}
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mt-2">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-black text-[#0F172A]">Recent Exports</h3>
                    <button className="text-sm font-bold text-[#F4B400] hover:text-[#171C2D] transition-colors flex items-center gap-1">
                        View All History <ArrowRight size={16} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Report Name</th>
                                <th className="px-6 py-4">Format</th>
                                <th className="px-6 py-4">Generated By</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[
                                { name: "Sales Report", format: "PDF", user: "System Admin", date: "26 Jun 2026", status: "Completed" },
                                { name: "Employee Performance", format: "Excel", user: "Aarthi D", date: "25 Jun 2026", status: "Completed" },
                                { name: "Lead Export_Q2", format: "CSV", user: "System Admin", date: "22 Jun 2026", status: "Completed" },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-[#0F172A]">{row.name}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block">{row.format}</span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-500">{row.user}</td>
                                    <td className="px-6 py-4 font-semibold text-slate-500">{row.date}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-1 rounded-full">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div> {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-[#171C2D] transition-colors p-2 rounded-lg hover:bg-slate-100 inline-block font-medium text-xs flex items-center gap-1 ml-auto">
                                            <FileDown size={14} /> Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </ReportsTemplate>
    );
};

export default function Reports() {
    const location = useLocation();

    return (
        <AdminLayout>
            {/* The wrapper layout stays simple, we delegate the UI to the loaded components */}
            <div className="p-8 pb-24 max-w-[1400px] mx-auto">
                <Routes>
                    <Route path="/" element={<Navigate to="analytics" replace />} />
                    <Route path="analytics" element={<DashboardAnalytics />} />
                    <Route path="sales" element={<SalesReports />} />
                    <Route path="performance" element={<EmployeePerformance />} />
                    <Route path="export" element={<ExportReports />} />
                </Routes>
            </div>
        </AdminLayout>
    );
}
