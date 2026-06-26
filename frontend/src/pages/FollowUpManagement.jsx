import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Notification from "../components/Notification";
import { useNotify } from "../hooks/useNotify";
import api from "../api";

const FollowUpManagement = () => {
    const { notification, notify } = useNotify();
    const [followups, setFollowups] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newFollowup, setNewFollowup] = useState({
        customerName: "",
        schedule: "",
        type: "Call",
        notes: ""
    });

    const fetchFollowUps = async () => {
        try {
            setIsFetching(true);
            const { data } = await api.get("/followups");
            setFollowups(data.data);
        } catch (err) {
            notify("error", "Failed to fetch followups");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchFollowUps();
    }, []);

    const handleAddFollowup = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            // Hardcoding assignedTo to current admin for simplicity in demo
            const user = JSON.parse(localStorage.getItem("user"));
            const { data } = await api.post("/followups", { ...newFollowup, assignedTo: user._id });
            setFollowups([data.data, ...followups]);
            setShowAddModal(false);
            setNewFollowup({ customerName: "", schedule: "", type: "Call", notes: "" });
            notify("success", "Follow-up scheduled successfully");
        } catch (err) {
            notify("error", err.response?.data?.message || "Failed to schedule followup");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-[1440px] mx-auto p-lg">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Follow-Up Management</h2>
                        <p className="text-slate-500 text-lg">Oversee client interactions and maintain communication consistency.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-lg py-sm bg-[#7a641d] text-white font-bold rounded-lg flex items-center shadow-md hover:opacity-90 transition-all"
                    >
                        <span className="material-symbols-outlined mr-2">event_available</span>
                        Schedule Follow-Up
                    </button>
                </div>

                <Notification notification={notification} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
                    <StatCard label="Today's Follow-Ups" value={followups.filter(f => new Date(f.schedule).toDateString() === new Date().toDateString()).length} icon="calendar_today" color="bg-slate-50" />
                    <StatCard label="Upcoming" value={followups.filter(f => f.status === 'Planned').length} icon="upcoming" color="bg-slate-50" />
                    <StatCard label="Completed" value={followups.filter(f => f.status === 'Completed').length} icon="check_circle" color="bg-slate-50" badge="88% Completion" />
                    <StatCard label="Missed" value={followups.filter(f => f.status === 'Missed').length} icon="warning" color="bg-rose-50 text-rose-600" badge="Requires Action" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
                    {/* Main List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-lg rounded-2xl border border-slate-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold">Engagement Overview</h3>
                                <div className="flex gap-2">
                                    <select className="text-xs font-bold border rounded p-1"><option>All Status</option></select>
                                    <input type="date" className="text-xs border rounded p-1" />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th className="pb-4">Customer</th>
                                            <th className="pb-4">Assigned Employee</th>
                                            <th className="pb-4">Schedule</th>
                                            <th className="pb-4">Notes</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {isFetching ? (
                                            <tr><td colSpan="4" className="py-10 text-center text-slate-400 font-bold">Loading Follow-ups...</td></tr>
                                        ) : followups.length === 0 ? (
                                            <tr><td colSpan="4" className="py-10 text-center text-slate-400 font-bold">No follow-ups scheduled.</td></tr>
                                        ) : (
                                            followups.map(f => (
                                                <tr key={f._id} className="group hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold">{(f.customerName || '?').charAt(0).toUpperCase()}</div>
                                                            <div>
                                                                <p className="text-sm font-bold">{f.customerName || "Unknown Customer"}</p>
                                                                <p className="text-[10px] text-slate-400">{f.type} Interaction</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <div className="flex items-center gap-2 text-xs text-slate-600">
                                                            <span className="material-symbols-outlined text-sm">person_outline</span>
                                                            {f.assignedTo?.name || "Self"}
                                                        </div>
                                                    </td>
                                                    <td className="py-4">
                                                        <p className="text-xs font-bold">{new Date(f.schedule).toLocaleDateString()}</p>
                                                        <p className="text-[10px] text-slate-400">{new Date(f.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </td>
                                                    <td className="py-4 text-xs text-slate-500 max-w-[200px] truncate">{f.notes}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Side Panels */}
                    <div className="space-y-6">
                        <SideList
                            label="Overdue"
                            count={followups.filter(f => f.status === 'Missed' || (new Date(f.schedule) < new Date() && f.status !== 'Completed')).length}
                            icon="error" color="text-rose-500"
                            items={followups.filter(f => f.status === 'Missed' || (new Date(f.schedule) < new Date() && f.status !== 'Completed')).slice(0, 3).map(f => ({
                                title: `${f.type} with ${f.customerName}`,
                                sub: 'Needs attention',
                                color: "bg-rose-50"
                            }))}
                        />
                        <SideList
                            label="Today"
                            count={followups.filter(f => new Date(f.schedule).toDateString() === new Date().toDateString()).length}
                            icon="event" color="text-amber-500"
                            items={followups.filter(f => new Date(f.schedule).toDateString() === new Date().toDateString()).slice(0, 3).map(f => ({
                                title: f.type,
                                sub: `${new Date(f.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ${f.customerName}`,
                                color: "border-l-4 border-amber-400 pl-4 bg-white"
                            }))}
                        />
                    </div>
                </div>
            </div>

            {/* Add FollowUp Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Schedule Interaction</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleAddFollowup} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Customer Name</label>
                                <input
                                    type="text" required placeholder="Jonathan Sterling"
                                    value={newFollowup.customerName}
                                    onChange={(e) => setNewFollowup({ ...newFollowup, customerName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-container/10 transition-all text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Schedule Date & Time</label>
                                    <input
                                        type="datetime-local" required
                                        value={newFollowup.schedule}
                                        onChange={(e) => setNewFollowup({ ...newFollowup, schedule: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-container/10 transition-all text-sm"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Interaction Type</label>
                                    <select
                                        value={newFollowup.type}
                                        onChange={(e) => setNewFollowup({ ...newFollowup, type: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-container/10 transition-all text-sm"
                                    >
                                        <option value="Call">Phone Call</option>
                                        <option value="Email">Email</option>
                                        <option value="Meeting">Property Meeting</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Notes / Objectives</label>
                                <textarea
                                    rows="3"
                                    value={newFollowup.notes}
                                    onChange={(e) => setNewFollowup({ ...newFollowup, notes: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary-container/10 transition-all text-sm resize-none"
                                    placeholder="What needs to be discussed? e.g. Review contract terms..."
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-[#7a641d] text-white py-4 rounded-xl font-bold hover:opacity-95 transition-all mt-4 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Scheduling...' : 'Set Follow-up'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

const StatCard = ({ label, value, icon, color, badge }) => (
    <div className={`bg-white p-lg rounded-2xl border border-slate-200 flex flex-col gap-4 ${color}`}>
        <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-400">{icon}</span>
            </div>
            {badge && <span className={`text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${badge.includes('Action') ? 'bg-rose-100 text-rose-600' : 'bg-green-100 text-green-600'}`}>{badge}</span>}
        </div>
        <div>
            <h3 className="text-2xl font-black text-slate-900">{value}</h3>
            <p className="text-xs font-medium text-slate-400">{label}</p>
        </div>
    </div>
);

const SideList = ({ label, count, icon, color, items }) => (
    <div className="bg-white p-lg rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
                <span className={`material-symbols-outlined text-sm ${color}`}>{icon}</span>
                {label}
            </h4>
            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold flex items-center justify-center">{count}</span>
        </div>
        <div className="space-y-3">
            {items.map((item, i) => (
                <div key={i} className={`p-4 rounded-xl ${item.color}`}>
                    <p className="text-xs font-bold text-slate-900">{item.title}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.sub}</p>
                </div>
            ))}
        </div>
    </div>
);

export default FollowUpManagement;
