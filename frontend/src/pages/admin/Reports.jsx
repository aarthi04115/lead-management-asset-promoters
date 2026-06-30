import { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import api from "../../api";
import {
    BarChart3, Download, TrendingUp, Users, Calendar,
    Activity, ArrowRight, FileText, FileSpreadsheet, Printer,
    FileStack, Clock, LayoutTemplate, HardDrive, Filter, RotateCcw,
    Building2, MapPin, FileDown, Table as TableIcon, FileDigit
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart as RePieChart, Pie, Cell
} from "recharts";

const COLORS = ["#F4B400", "#171C2D", "#22C55E", "#3B82F6", "#EC4899", "#8B5CF6"];

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

const DashboardAnalytics = ({ leads, properties, users, loading }) => {
    // Calculate live KPI metrics
    const closedLeads = leads.filter(l => ['Closed', 'Won', 'Sold', 'Booked'].includes(l.status));
    const totalRevenueSum = closedLeads.reduce((sum, l) => {
        const price = l.propertyInterested?.price || parseFloat(l.budget) || 0;
        return sum + price;
    }, 0);

    const formattedRevenue = totalRevenueSum >= 1000000
        ? `$${(totalRevenueSum / 1000000).toFixed(1)}M`
        : totalRevenueSum >= 1000 ? `$${(totalRevenueSum / 1000).toFixed(0)}K` : `$${totalRevenueSum}`;

    const conversionRate = leads.length > 0
        ? ((closedLeads.length / leads.length) * 100).toFixed(1) + "%"
        : "0.0%";

    const activeEmployeesCount = users.filter(u => u.role === 'employee').length;

    // Compile dynamic lead sources
    const counts = {};
    leads.forEach(l => {
        const src = l.source || "Website";
        counts[src] = (counts[src] || 0) + 1;
    });
    const pieData = Object.keys(counts).map(key => ({
        name: key,
        value: counts[key]
    }));

    const sourceColors = {
        "Website": "#171C2D",
        "Google Ads": "#F4B400",
        "Facebook": "#3B82F6",
        "Referral": "#22C55E",
        "Direct": "#94A3B8"
    };

    // Compile dynamic month data
    const monthMap = {};
    leads.forEach(l => {
        if (!l.createdAt) return;
        const d = new Date(l.createdAt);
        const monthLabel = d.toLocaleString('en-US', { month: 'short' });
        monthMap[monthLabel] = (monthMap[monthLabel] || 0) + 1;
    });

    const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let areaData = monthsOrder.map(m => ({
        name: m,
        revenue: (monthMap[m] || 0) * 120000 // mock revenue representation per lead
    })).filter(item => item.revenue > 0);

    if (areaData.length === 0) {
        areaData = [
            { name: "Jan", revenue: 240000 },
            { name: "Feb", revenue: 139000 },
            { name: "Mar", revenue: 980000 },
            { name: "Apr", revenue: 390000 },
            { name: "May", revenue: 480000 },
            { name: "Jun", revenue: 380000 },
        ];
    }

    return (
        <ReportsTemplate title="Dashboard Analytics" subtitle="High-level metrics and global performance trends.">
            {loading ? (
                <div className="py-20 text-center text-sm font-bold text-slate-400">Loading metrics...</div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-4">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-[#171C2D] text-[#F4B400] rounded-xl"><TrendingUp size={22} /></div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">Total Revenue</p>
                                <h4 className="text-2xl font-black text-[#0F172A] leading-none mb-1">{formattedRevenue}</h4>
                                <p className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 inline-block px-2 py-0.5 rounded-md">Live Bookings</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-[#171C2D] text-[#F4B400] rounded-xl"><Activity size={22} /></div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">Conversions</p>
                                <h4 className="text-2xl font-black text-[#0F172A] leading-none mb-1">{conversionRate}</h4>
                                <p className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 inline-block px-2 py-0.5 rounded-md">Leads Won</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-[#171C2D] text-[#F4B400] rounded-xl"><Users size={22} /></div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 mb-1">Active Employees</p>
                                <h4 className="text-2xl font-black text-[#0F172A] leading-none mb-1">{activeEmployeesCount}</h4>
                                <p className="text-xs font-bold text-slate-400 bg-slate-100 inline-block px-2 py-0.5 rounded-md">Brokers & Execs</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                            <h3 className="text-base font-bold text-[#0F172A] mb-6">Revenue Overview Trends</h3>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                                        <Pie data={pieData.length > 0 ? pieData : [{ name: 'None', value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={sourceColors[entry.name] || COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center mt-2">
                                {pieData.map((entry, i) => (
                                    <div key={i} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sourceColors[entry.name] || COLORS[i % COLORS.length] }} />
                                        {entry.name} ({entry.value})
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </ReportsTemplate>
    );
};

const EmployeePerformance = ({ leads, followups, sitevisits, users, loading }) => {
    return (
        <ReportsTemplate title="Employee Performance" subtitle="Track staff conversion metrics and task execution.">
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden mt-4">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-base font-bold text-[#0F172A]">Top Performing Employees</h3>
                    <span className="text-xs font-bold text-[#F4B400] bg-[#F4B400]/10 px-3 py-1 rounded-full uppercase tracking-wider">This Month</span>
                </div>
                {loading ? (
                    <div className="py-12 text-center text-sm font-bold text-slate-400">Loading performance data...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Leads Assigned</th>
                                    <th className="px-6 py-4">Site Visits</th>
                                    <th className="px-6 py-4">Deals Closed</th>
                                    <th className="px-6 py-4">Completed Followups</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.filter(u => u.role === 'employee').map((emp, i) => {
                                    const userLeads = leads.filter(l => (l.assignedTo?._id || l.assignedTo) === emp._id).length;
                                    const userVisits = sitevisits.filter(v => (v.agent?._id || v.agent) === emp._id).length;
                                    const userClosed = leads.filter(l => (l.assignedTo?._id || l.assignedTo) === emp._id && ['Closed', 'Won', 'Sold', 'Booked'].includes(l.status)).length;
                                    const userCompletedFups = followups.filter(f => (f.assignedTo?._id || f.assignedTo) === emp._id && f.status === 'Completed').length;

                                    return (
                                        <tr key={emp._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-[#171C2D] text-white flex items-center justify-center text-xs font-bold">
                                                        {emp.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-[#0F172A]">{emp.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">Sales Agent</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-600">{userLeads}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-600">{userVisits}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#22C55E]/10 text-[#22C55E] font-bold rounded-lg pointer-events-none">
                                                    {userClosed}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-slate-600">{userCompletedFups}</td>
                                        </tr>
                                    );
                                })}
                                {users.filter(u => u.role === 'employee').length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="py-8 text-center text-xs font-bold text-slate-400">No agents registered in database</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </ReportsTemplate>
    );
};

const ExportReports = ({ leads, followups, properties, sitevisits, users, loading }) => {
    const [selectedType, setSelectedType] = useState('Sales Report');
    const [selectedFormat, setSelectedFormat] = useState('CSV');
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [selectedEmployee, setSelectedEmployee] = useState('All');

    const reportTypes = [
        { id: 'Sales Report', icon: TrendingUp, desc: 'Revenue & closing metrics' },
        { id: 'Lead Report', icon: Users, desc: 'Lead pipeline & sources' },
        { id: 'Employee Performance', icon: Activity, desc: 'Staff ranking & efficiency' },
        { id: 'Property Report', icon: Building2, desc: 'Inventory & availability' },
        { id: 'Site Visit Report', icon: MapPin, desc: 'Scheduled & completed tours' },
    ];

    const formats = [
        { id: 'Excel', icon: FileSpreadsheet, desc: 'Advanced analysis' },
        { id: 'CSV', icon: TableIcon, desc: 'Raw data import' }
    ];

    // Filter dynamic counts
    const getReportCounts = () => {
        if (selectedType === 'Sales Report') {
            return leads.filter(l => ['Closed', 'Won', 'Sold', 'Booked'].includes(l.status)).length;
        } else if (selectedType === 'Lead Report') {
            return leads.length;
        } else if (selectedType === 'Employee Performance') {
            return users.filter(u => u.role === 'employee').length;
        } else if (selectedType === 'Property Report') {
            return properties.length;
        } else if (selectedType === 'Site Visit Report') {
            return sitevisits.length;
        }
        return 0;
    };

    const handleExport = () => {
        let headers = [];
        let rows = [];
        let filename = `smart_crm_${selectedType.replace(/\s+/g, '_').toLowerCase()}`;

        // Dynamic target users logic if filter selected
        const filteredUsers = selectedEmployee === 'All'
            ? users.filter(u => u.role === 'employee')
            : users.filter(u => u._id === selectedEmployee);

        if (selectedType === 'Sales Report') {
            headers = ["Lead Name", "Email", "Phone", "Status", "Source", "Property Interested", "Price", "Created Date"];
            let salesLeads = leads.filter(l => ['Closed', 'Won', 'Sold', 'Booked'].includes(l.status));
            if (selectedEmployee !== 'All') {
                salesLeads = salesLeads.filter(l => (l.assignedTo?._id || l.assignedTo) === selectedEmployee);
            }
            rows = salesLeads.map(l => [
                l.name || "",
                l.email || "",
                l.phone || "",
                l.status || "",
                l.source || "",
                l.propertyInterested?.name || l.propertyInterested || "",
                l.propertyInterested?.price || parseFloat(l.budget) || l.budget || "",
                l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""
            ]);
        } else if (selectedType === 'Lead Report') {
            headers = ["Name", "Email", "Phone", "Status", "Source", "Property Interested", "Budget", "Created Date"];
            let filteredLeads = leads;
            if (selectedEmployee !== 'All') {
                filteredLeads = filteredLeads.filter(l => (l.assignedTo?._id || l.assignedTo) === selectedEmployee);
            }
            rows = filteredLeads.map(l => [
                l.name || "",
                l.email || "",
                l.phone || "",
                l.status || "",
                l.source || "",
                l.propertyInterested?.name || l.propertyInterested || "",
                l.budget || "",
                l.createdAt ? new Date(l.createdAt).toLocaleDateString() : ""
            ]);
        } else if (selectedType === 'Employee Performance') {
            headers = ["Employee Name", "Email", "Role", "Assigned Leads", "Total Followups", "Completed Followups", "Site Visits", "Closed Deals"];
            rows = filteredUsers.map(u => {
                const empLeads = leads.filter(l => (l.assignedTo?._id || l.assignedTo) === u._id).length;
                const empFups = followups.filter(f => (f.assignedTo?._id || f.assignedTo) === u._id);
                const empVisits = sitevisits.filter(v => (v.agent?._id || v.agent) === u._id).length;
                const empClosed = leads.filter(l => (l.assignedTo?._id || l.assignedTo) === u._id && ['Closed', 'Won', 'Sold', 'Booked'].includes(l.status)).length;
                return [
                    u.name || "",
                    u.email || "",
                    u.role || "",
                    empLeads,
                    empFups.length,
                    empFups.filter(f => f.status === 'Completed').length,
                    empVisits,
                    empClosed
                ];
            });
        } else if (selectedType === 'Property Report') {
            headers = ["Property Name", "Location", "Type", "Price", "Status", "Bedrooms", "Bathrooms", "Area (sqft)"];
            rows = properties.map(p => [
                p.name || "",
                p.location || "",
                p.type || "",
                p.price || "",
                p.status || "",
                p.features?.bedrooms || "",
                p.features?.bathrooms || "",
                p.features?.area || ""
            ]);
        } else if (selectedType === 'Site Visit Report') {
            headers = ["Customer Name", "Lead Email", "Property", "Agent Name", "Scheduled Date", "Status", "GPS Coordinates"];
            let filteredVisits = sitevisits;
            if (selectedEmployee !== 'All') {
                filteredVisits = filteredVisits.filter(v => (v.agent?._id || v.agent) === selectedEmployee);
            }
            rows = filteredVisits.map(v => [
                v.customerName || v.leadId?.name || "N/A",
                v.leadId?.email || "N/A",
                v.propertyId?.name || v.propertyId || "N/A",
                v.agent?.name || "N/A",
                v.dateTime ? new Date(v.dateTime).toLocaleString() : "",
                v.status || "Pending",
                v.geotag ? `${v.geotag.latitude}, ${v.geotag.longitude}` : "N/A"
            ]);
        }

        const csvString = [
            headers.join(","),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
        ].join("\n");

        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}.${selectedFormat === 'Excel' ? 'xlsx' : 'csv'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <ReportsTemplate title="Export Reports" subtitle="Generate and download business reports in multiple formats.">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 mb-8">
                {[
                    { label: "Total Active Leads", value: leads.length, icon: FileStack, color: "text-blue-500" },
                    { label: "Total Follow-ups", value: followups.length, icon: Clock, color: "text-orange-500" },
                    { label: "Active Staff", value: users.length, icon: LayoutTemplate, color: "text-[#22C55E]" },
                    { label: "Total Properties", value: properties.length, icon: HardDrive, color: "text-[#F4B400]" },
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
                <div className="lg:col-span-8 space-y-8">
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

                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-black text-[#0F172A]">Filter Settings</h3>
                            <button
                                onClick={() => { setDateRange('Last 30 Days'); setSelectedEmployee('All'); }}
                                className="text-xs font-bold text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                            >
                                <RotateCcw size={12} /> Reset Filters
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date Range</label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F4B400] transition-colors"
                                >
                                    <option>Last 30 Days</option>
                                    <option>This Quarter</option>
                                    <option>Year to Date</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Employee</label>
                                <select
                                    value={selectedEmployee}
                                    onChange={(e) => setSelectedEmployee(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F172A] outline-none focus:border-[#F4B400] transition-colors"
                                >
                                    <option value="All">All Employees</option>
                                    {users.filter(u => u.role === 'employee').map(u => (
                                        <option key={u._id} value={u._id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm">
                        <h3 className="text-lg font-black text-[#0F172A] mb-4">Export Format</h3>
                        <div className="grid grid-cols-2 gap-4 max-w-md">
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

                <div className="lg:col-span-4 space-y-6 relative">
                    <div className="sticky top-24 space-y-6">
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
                                    <span className="font-bold text-[#0F172A]">{dateRange}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-semibold text-slate-500">Records Count:</span>
                                    <span className="font-bold text-[#22C55E]">~ {getReportCounts()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleExport}
                                className="w-full bg-[#171C2D] text-white hover:bg-[#F4B400] hover:text-[#171C2D] hover:shadow-lg shadow-md transition-all duration-300 font-bold py-4 rounded-xl flex items-center justify-center gap-3 group text-lg"
                            >
                                <Download size={22} className="transition-transform group-hover:-translate-y-1" />
                                Generate & Export
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </ReportsTemplate>
    );
};

export default function Reports() {
    const [leads, setLeads] = useState([]);
    const [followups, setFollowups] = useState([]);
    const [properties, setProperties] = useState([]);
    const [sitevisits, setSitevisits] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [leadRes, fupRes, propRes, svRes, userRes] = await Promise.all([
                    api.get("/leads").catch(() => ({ data: { data: [] } })),
                    api.get("/followups").catch(() => ({ data: { data: [] } })),
                    api.get("/properties").catch(() => ({ data: { data: [] } })),
                    api.get("/sitevisits").catch(() => ({ data: { data: [] } })),
                    api.get("/auth/admin/users").catch(() => ({ data: { data: [] } }))
                ]);
                setLeads(leadRes.data.data || []);
                setFollowups(fupRes.data.data || []);
                setProperties(propRes.data.data || []);
                setSitevisits(svRes.data.data || []);
                setUsers(userRes.data.data || []);
            } catch (err) {
                console.error("Failed to load reports data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <AdminLayout>
            <div className="p-8 pb-24 max-w-[1400px] mx-auto">
                <Routes>
                    <Route path="/" element={<Navigate to="analytics" replace />} />
                    <Route path="analytics" element={<DashboardAnalytics leads={leads} properties={properties} users={users} loading={loading} />} />
                    <Route path="performance" element={<EmployeePerformance leads={leads} followups={followups} sitevisits={sitevisits} users={users} loading={loading} />} />
                    <Route path="export" element={<ExportReports leads={leads} followups={followups} properties={properties} sitevisits={sitevisits} users={users} loading={loading} />} />
                </Routes>
            </div>
        </AdminLayout>
    );
}
