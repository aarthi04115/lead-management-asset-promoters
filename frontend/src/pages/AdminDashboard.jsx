import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import AdminLayout from "../components/AdminLayout";
import Notification from "../components/Notification";
import { useNotify } from "../hooks/useNotify";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, Legend
} from "recharts";
import {
  Users, Zap, Clock, ShieldCheck, Building2, MapPin,
  CheckCircle2, TrendingUp, Download, Table,
  MoreHorizontal, Phone, Flag
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const EMPTY_NEW_USER = { name: "", email: "", password: "", role: "employee" };

// Mock data to perfectly map the Line Chart & Donut Chart
const globalConversionData = [
  { name: 'JAN', leads: 800, followups: 200, visits: 100 },
  { name: 'FEB', leads: 1000, followups: 350, visits: 120 },
  { name: 'MAR', leads: 900, followups: 400, visits: 150 },
  { name: 'APR', leads: 1200, followups: 300, visits: 180 },
  { name: 'MAY', leads: 2200, followups: 500, visits: 200 },
  { name: 'JUN', leads: 3000, followups: 800, visits: 400 },
  { name: 'JUL', leads: 3200, followups: 1500, visits: 600 },
  { name: 'AUG', leads: 2800, followups: 2000, visits: 800 },
  { name: 'SEP', leads: 2600, followups: 2200, visits: 900 },
  { name: 'OCT', leads: 2500, followups: 1800, visits: 1100 },
  { name: 'NOV', leads: 3200, followups: 1600, visits: 1300 },
  { name: 'DEC', leads: 4200, followups: 1800, visits: 1800 },
];

const leadSourceData = [
  { name: 'Website', value: 40, color: '#0F172A' },
  { name: 'Google Ads', value: 25, color: '#EAB308' },
  { name: 'Facebook', value: 20, color: '#3B82F6' },
  { name: 'Referral', value: 15, color: '#94A3B8' },
];

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const { notification, notify } = useNotify();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0, todayLeads: 0, weeklyLeads: 0, monthlyLeads: 0,
    totalFollowUps: 0, totalSiteVisits: 0, closedDeals: 0, availableProperties: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const [isFetching, setIsFetching] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
  const [isCreating, setIsCreating] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const [userRes, leadRes, fupRes, svRes, propRes] = await Promise.all([
        api.get("/auth/admin/users"),
        api.get("/leads").catch(() => ({ data: { data: [] } })),
        api.get("/followups").catch(() => ({ data: { data: [] } })),
        api.get("/sitevisits").catch(() => ({ data: { data: [] } })),
        api.get("/properties").catch(() => ({ data: { data: [] } }))
      ]);
      setUsers(userRes.data.data);

      const leads = leadRes.data.data || [];
      const fups = fupRes.data.data || [];
      const svisits = svRes.data.data || [];
      const props = propRes.data.data || [];

      const now = new Date();
      const oneWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const oneMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      setStats({
        totalLeads: leads.length,
        todayLeads: leads.filter(l => new Date(l.createdAt).toDateString() === now.toDateString()).length,
        weeklyLeads: leads.filter(l => new Date(l.createdAt) >= oneWeek).length,
        monthlyLeads: leads.filter(l => new Date(l.createdAt) >= oneMonth).length,
        totalFollowUps: fups.length,
        totalSiteVisits: svisits.length,
        closedDeals: leads.filter(l => l.status === 'Closed' || l.status === 'Won').length,
        availableProperties: props.filter(p => p.status === 'Available').length
      });

      // Construct a faux Recent Activities stream by mixing latest db items
      const recentFups = fups.slice(0, 2).map(f => ({
        type: 'followup', icon: Phone, color: 'text-[#EAB308] bg-[#EAB308]/10',
        title: 'Follow-Up Scheduled', desc: `Scheduled with ${f.customerName || 'Unknown'} for ${new Date(f.schedule).toLocaleDateString()}`,
        time: 'Recently'
      }));
      const recentVisits = svisits.slice(0, 1).map(v => ({
        type: 'sitevisit', icon: MapPin, color: 'text-blue-500 bg-blue-500/10',
        title: 'Site Visit Scheduled', desc: `Visit assigned to ${v.agent?.name || 'Self'}`,
        time: 'Recently'
      }));
      const recentLeads = leads.slice(0, 2).map(l => ({
        type: 'lead', icon: Users, color: 'text-[#0F172A] bg-[#0F172A]/10',
        title: 'New Lead Inserted', desc: `${l.name} intent tracked.`,
        time: 'Recently'
      }));
      setRecentActivities([...recentFups, ...recentVisits, ...recentLeads]);
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleToggleActive = async (targetId, currentlyActive) => {
    try {
      await api.put(`/auth/admin/users/${targetId}`, { isActive: !currentlyActive });
      setUsers((prev) =>
        prev.map((u) => (u._id === targetId ? { ...u, isActive: !currentlyActive } : u))
      );
      notify("success", `User ${!currentlyActive ? "activated" : "deactivated"} successfully.`);
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleDelete = async (targetId, targetName) => {
    if (!window.confirm(`Delete "${targetName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/auth/admin/users/${targetId}`);
      setUsers((prev) => prev.filter((u) => u._id !== targetId));
      notify("success", `${targetName} has been removed.`);
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to delete user.");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (newUser.password.length < 6) return notify("error", "Password must be at least 6 characters.");
    setIsCreating(true);
    try {
      const { data } = await api.post("/auth/admin/users", newUser);
      setUsers((prev) => [data.data, ...prev]);
      setShowModal(false);
      setNewUser(EMPTY_NEW_USER);
      notify("success", `${data.data.name} created successfully.`);
    } catch (err) {
      notify("error", err.response?.data?.message || "Failed to create user.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 md:px-10 md:py-8 max-w-[1720px] mx-auto space-y-6 bg-slate-50 min-h-screen font-inter pb-20">

        {/* Create User Button - Float it to the right visually aligning with layout headers */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0F172A] opacity-0">Hidden Title</h2>
          <button onClick={() => setShowModal(true)} className="px-5 py-2.5 bg-[#0F172A] text-white rounded-lg flex items-center gap-2 text-xs font-black shadow-lg shadow-[#0F172A]/20 hover:scale-[1.02] transition-all active:scale-95 uppercase tracking-widest">
            <ShieldCheck size={16} /> Create User
          </button>
        </div>

        <Notification notification={notification} />

        {/* 1. KPI 8-Card Grid (Exact Replica) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <StatCard icon={Users} title="TOTAL LEADS" value={stats.totalLeads} trend="+12%" iconColor="text-[#0F172A]" />
          <StatCard icon={Zap} title="TODAY'S LEADS" value={stats.todayLeads} trend="+5%" iconColor="text-[#EAB308]" />
          <StatCard icon={TrendingUp} title="WEEKLY LEADS" value={stats.weeklyLeads} trend="-2%" negative iconColor="text-blue-500" />
          <StatCard icon={Clock} title="FOLLOW-UPS" value={stats.totalFollowUps} trend="+18%" iconColor="text-indigo-500" />

          <StatCard icon={MapPin} title="SITE VISITS" value={stats.totalSiteVisits} trend="+8%" iconColor="text-emerald-500" />
          <StatCard icon={Building2} title="MONTHLY LEADS" value={stats.monthlyLeads} trend="+32%" iconColor="text-purple-500" />
          <StatCard icon={CheckCircle2} title="CLOSED DEALS" value={stats.closedDeals} meta="Target Met" metaColor="text-green-600 bg-green-50" iconColor="text-[#EAB308]" overrideBg="bg-[#EAB308]" overrideIconColor="text-white" />
          <StatCard icon={Building2} title="AVAILABLE PROPERTIES" value={stats.availableProperties} meta="Market Value: $4.2M" metaColor="text-slate-400" iconColor="text-slate-700" />
        </div>

        {/* 2. Global Conversion Trends */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 pb-4">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold font-display text-[#0F172A]">Global Conversion Trends</h3>
              <p className="text-xs font-medium text-slate-500 mt-1">Real-time performance metrics across lead funnel</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-4 mr-4">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#0F172A]"></span><span className="text-[11px] font-bold text-slate-500">Leads</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#EAB308]"></span><span className="text-[11px] font-bold text-slate-500">Follow-Ups</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span><span className="text-[11px] font-bold text-slate-500">Site Visits</span></div>
              </div>
              <button className="px-3 py-1.5 border border-slate-200 rounded-md text-[11px] font-bold text-slate-600 bg-white shadow-sm flex items-center gap-1 hover:bg-slate-50">
                Last 30 Days <span className="material-symbols-outlined text-[14px]">expand_more</span>
              </button>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={globalConversionData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 800, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94A3B8' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }} />
                <Line type="monotone" dataKey="leads" stroke="#0F172A" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="followups" stroke="#EAB308" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="visits" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Bottom Ecosystem Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: Lead Sources & System Reports */}
          <div className="col-span-1 lg:col-span-4 space-y-6">

            {/* Lead Sources Donut */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <h3 className="text-lg font-bold font-display text-[#0F172A] mb-4">Lead Sources</h3>
              <div className="h-[220px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={leadSourceData} innerRadius={65} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                      {leadSourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-[#0F172A]">12.8k</span>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Leads</span>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {leadSourceData.map(source => (
                  <div key={source.name} className="flex justify-between items-center text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-500">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: source.color }}></span>
                      {source.name}
                    </div>
                    <span className="text-[#0F172A]">{source.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Reports */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-display text-[#0F172A]">System Reports</h3>
                <span className="material-symbols-outlined text-slate-400 text-[18px]">description</span>
              </div>
              <div className="space-y-3 mb-6">
                <ReportActionItem title="Daily Summary Report" time="Generated 4 hours ago" />
                <ReportActionItem title="Weekly Sales Analysis" time="Generated Mar 24, 2024" />
                <ReportActionItem title="Monthly Lead Lifecycle" time="Generated Mar 01, 2024" />
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50">
                  <Download size={14} /> Export CSV
                </button>
                <button className="flex-1 py-2.5 rounded-lg bg-[#EAB308]/20 text-[#B48400] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#EAB308]/30">
                  <Table size={14} /> Excel
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Top Performers & Recent Activities */}
          <div className="col-span-1 lg:col-span-8 space-y-6">

            {/* Top Performers (Mapped to Staff User Management for CRM continuity) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[400px]">
              <div className="p-8 pb-4 flex justify-between items-center shrink-0">
                <h3 className="text-lg font-bold font-display text-[#0F172A]">Top Performers <span className="ml-2 text-xs font-medium text-slate-400 font-sans tracking-tight">(Staff Access Management)</span></h3>
                <button className="text-[11px] font-black uppercase text-[#EAB308] hover:underline">View All Teams</button>
              </div>

              <div className="overflow-auto flex-1 px-8 pb-6 custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Employee Name</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Identity</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Visits</th>
                      <th className="pb-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Closure</th>
                      <th className="pb-3 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Access Control</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isFetching ? (
                      <tr><td colSpan="5" className="py-8 text-center text-xs font-bold text-slate-400">Syncing Employees...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan="5" className="py-8 text-center text-xs font-bold text-slate-400">No staff found</td></tr>
                    ) : (
                      users.map((u, i) => {
                        const isSelf = u._id === currentAdmin?._id;
                        return (
                          <tr key={u._id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 group transition-colors">
                            <td className="py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-black shadow-lg shadow-[#0F172A]/10">
                                  {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-[13px] font-bold text-[#0F172A] whitespace-nowrap">{u.name}</p>
                                  <p className="text-[10px] font-medium text-slate-400">{u.role === 'admin' ? 'Senior Broker' : 'Execution Agent'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 text-[13px] font-bold text-slate-500">{u.email}</td>
                            <td className="py-4 text-[13px] font-bold text-slate-600">{10 + i * 4}</td>
                            <td className="py-4">
                              <span className="w-6 h-6 rounded bg-[#EAB308]/10 text-[#EAB308] flex items-center justify-center text-[10px] font-black">{Math.floor(Math.random() * 15) + 1}</span>
                            </td>
                            <td className="py-4 text-right">
                              {isSelf ? (
                                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Current</span>
                              ) : (
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleToggleActive(u._id, u.isActive)} className={cn("text-[10px] font-black uppercase hover:underline tracking-widest", u.isActive ? 'text-amber-500' : 'text-emerald-500')}>
                                    {u.isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                  <button onClick={() => handleDelete(u._id, u.name)} className="text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest hover:underline">
                                    Delete
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex-1">
              <h3 className="text-lg font-bold font-display text-[#0F172A] mb-8">Recent Activities</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-[0.5px] md:before:mx-auto md:before:translate-x-0 before:h-full before:w-px before:bg-gradient-to-b before:from-transparent before:via-[#0F172A]/10 before:to-transparent">
                {recentActivities.length === 0 && <p className="text-xs font-bold text-slate-400">No recent activity detected.</p>}
                {recentActivities.map((act, i) => (
                  <div key={i} className="relative flex items-start justify-between gap-4 md:gap-6">
                    <div className="flex items-start gap-4 z-10 w-full">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm", act.color)}>
                        <act.icon size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A] leading-tight">{act.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{act.desc}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap pt-1 tracking-widest">{act.time}</span>
                  </div>
                ))}

                {/* Static Activity to match picture feel if empty */}
                {recentActivities.length < 2 && (
                  <div className="relative flex items-start justify-between gap-4 md:gap-6">
                    <div className="flex items-start gap-4 z-10 w-full">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[3px] border-white shadow-sm bg-[#EAB308] text-white">
                        <TrendingUp size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#0F172A] leading-tight flex items-center gap-1">Deal Closed: $2.4M Sale <span className="font-black text-[#EAB308]">★</span></p>
                        <p className="text-xs text-slate-500 mt-1">Julianne Moore closed "The Grand Estate - Lot 4". Paperwork sent to legal.</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black uppercase text-slate-400 whitespace-nowrap pt-1 tracking-widest">Today, 9:15 AM</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center font-inter">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></motion.div>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-[32px] shadow-2xl p-10 border border-slate-100" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-black font-display text-[#0F172A] tracking-tight">System Staff</h3>
                  <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mt-1">Provision Access</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#EAB308]/10 text-[#EAB308] flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Full Name</label>
                  <input type="text" required placeholder="John Executive" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-50 hover:border-slate-100 focus:bg-white rounded-xl px-4 py-3 outline-none focus:border-[#0F172A] transition-all text-sm font-bold text-[#0F172A]" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Email</label>
                  <input type="email" required placeholder="name@smartrealestate.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-50 hover:border-slate-100 focus:bg-white rounded-xl px-4 py-3 outline-none focus:border-[#0F172A] transition-all text-sm font-bold text-[#0F172A]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Password</label>
                    <input type="password" required placeholder="Min 6 chars" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-50 hover:border-slate-100 focus:bg-white rounded-xl px-4 py-3 outline-none focus:border-[#0F172A] transition-all text-sm font-bold text-[#0F172A]" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Role</label>
                    <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full bg-slate-50 border-2 border-slate-50 hover:border-slate-100 focus:bg-white rounded-xl px-4 py-3 outline-none focus:border-[#0F172A] transition-all text-sm font-bold text-[#0F172A]">
                      <option value="employee">Agent</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button type="button" onClick={() => setShowModal(false)} className="w-1/3 py-3 rounded-lg border border-slate-200 font-black text-[11px] uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={isCreating} className="w-2/3 py-3 rounded-lg font-black text-[11px] uppercase tracking-[0.2em] transition-all bg-[#0F172A] text-white hover:scale-[1.02] active:scale-95 disabled:opacity-50">
                    {isCreating ? 'Creating...' : 'Create Record'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

const StatCard = ({ icon: Icon, title, value, trend, negative, meta, overrideBg, overrideIconColor, iconColor, metaColor }) => (
  <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group h-[140px]">
    <div className="flex justify-between items-start">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform", overrideBg || "bg-slate-50", overrideIconColor || iconColor)}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      {trend && (
        <div className={cn("flex items-center gap-1 text-[11px] font-black uppercase tracking-wider", negative ? "text-rose-500" : "text-[#EAB308]")}>
          <TrendingUp size={12} className={negative ? "rotate-180" : ""} strokeWidth={3} /> {trend}
        </div>
      )}
      {meta && (
        <div className={cn("flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-slate-100", metaColor || "text-slate-500")}>
          {meta === 'Target Met' ? <CheckCircle2 size={10} /> : <Building2 size={10} />} {meta}
        </div>
      )}
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 leading-none">{title}</p>
      <p className="text-3xl font-black font-display text-[#0F172A] leading-none shrink-0 truncate">{value.toLocaleString()}</p>
    </div>
  </div>
);

const ReportActionItem = ({ title, time }) => (
  <div className="px-5 py-4 bg-[#f8fafc] border border-slate-100 rounded-xl flex justify-between items-center group cursor-pointer hover:border-slate-300 transition-colors">
    <div>
      <p className="text-[13px] font-bold text-blue-900/80 mb-0.5">{title}</p>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{time}</p>
    </div>
  </div>
);

export default AdminDashboard;
