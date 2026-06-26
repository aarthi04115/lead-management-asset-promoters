import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Notification from "../components/Notification";
import { useNotify } from "../hooks/useNotify";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, UserCog, UserPlus, Search, Building2 } from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const EMPTY_NEW_USER = { name: "", email: "", password: "", role: "employee" };

export default function EmployeeManagement() {
    const { user: currentAdmin } = useAuth();
    const { notification, notify } = useNotify();

    const [users, setUsers] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState(EMPTY_NEW_USER);
    const [isCreating, setIsCreating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const loadUsers = async () => {
        try {
            const res = await api.get("/auth/admin/users");
            setUsers(res.data.data);
        } catch (err) {
            notify("error", "Failed to load system staff");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleToggleActive = async (id, currentStatus) => {
        try {
            await api.patch(`/auth/admin/users/${id}/status`, { isActive: !currentStatus });
            setUsers(users.map(u => u._id === id ? { ...u, isActive: !currentStatus } : u));
            notify("success", `User account ${!currentStatus ? 'activated' : 'deactivated'}.`);
        } catch (err) {
            notify("error", "Failed to update user status");
        }
    };

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Permanently delete account for ${name}?`)) return;
        try {
            await api.delete(`/auth/admin/users/${id}`);
            setUsers(users.filter(u => u._id !== id));
            notify("success", `User ${name} deleted.`);
        } catch (err) {
            notify("error", "Failed to delete user");
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
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

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="p-8 pb-24 max-w-7xl mx-auto space-y-6">
                <Notification notification={notification} />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Employee Directory</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Manage system access, roles, and analytical tracking.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-[#171C2D] text-white rounded-xl flex items-center gap-2 text-sm font-bold shadow-lg shadow-[#171C2D]/20 hover:bg-[#F4B400] hover:text-[#171C2D] transition-colors"
                    >
                        <UserPlus size={18} /> Provision New Account
                    </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
                        <h3 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                            <UserCog size={20} className="text-[#F4B400]" />
                            Staff Access Management
                        </h3>
                        <div className="relative w-full sm:w-80">
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-[#F4B400] transition-colors shadow-sm"
                            />
                            <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left whitespace-nowrap">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Employee Profile</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Email Identity</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">System Role</th>
                                    <th className="px-6 py-4 text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Status</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100">Access Control</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isFetching ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-sm font-bold text-slate-400">Syncing Employees...</td></tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr><td colSpan="5" className="py-12 text-center text-sm font-bold text-slate-400">No matching staff found in directory</td></tr>
                                ) : (
                                    filteredUsers.map((u, i) => {
                                        const isSelf = u._id === currentAdmin?._id;
                                        return (
                                            <tr key={u._id} className="hover:bg-slate-50/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-[#171C2D] text-[#F4B400] flex items-center justify-center text-xs font-black shadow-inner">
                                                            {u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#0F172A]">{u.name}</p>
                                                            <p className="text-xs font-medium text-slate-400">ID: {u._id.substring(u._id.length - 6).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-bold text-slate-500">{u.email}</td>
                                                <td className="px-6 py-4">
                                                    <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", u.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                                                        {u.role === 'admin' ? 'Senior Admin' : 'Agent'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-50 px-2.5 py-1 text-slate-600 rounded-full border border-slate-200">
                                                        <div className={cn("w-2 h-2 rounded-full", u.isActive ? 'bg-[#22C55E]' : 'bg-rose-500')}></div>
                                                        {u.isActive ? 'Active' : 'Suspended'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {isSelf ? (
                                                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Current Session</span>
                                                    ) : (
                                                        <div className="flex gap-4 justify-end">
                                                            <button onClick={() => handleToggleActive(u._id, u.isActive)} className={cn("text-xs font-bold transition-colors", u.isActive ? 'text-amber-500 hover:text-amber-600' : 'text-emerald-500 hover:text-emerald-600')}>
                                                                {u.isActive ? 'Deactivate' : 'Activate'}
                                                            </button>
                                                            <button onClick={() => handleDelete(u._id, u.name)} className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors">
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

                {/* Create User Modal */}
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center font-inter px-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></motion.div>
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-slate-100" onClick={(e) => e.stopPropagation()}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">System Staff</h3>
                                        <p className="text-xs font-bold tracking-widest uppercase text-slate-400 mt-1">Provision Access</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-[#171C2D] text-[#F4B400] flex items-center justify-center shadow-inner">
                                        <ShieldCheck size={24} />
                                    </div>
                                </div>

                                <form onSubmit={handleCreateUser} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Full Name</label>
                                        <input type="text" required placeholder="John Executive" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#F4B400] transition-colors text-sm font-bold text-[#0F172A]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Email</label>
                                        <input type="email" required placeholder="name@smartcrm.com" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#F4B400] transition-colors text-sm font-bold text-[#0F172A]" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Password</label>
                                            <input type="password" required placeholder="Min 6 chars" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#F4B400] transition-colors text-sm font-bold text-[#0F172A]" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#0F172A] ml-1">Role</label>
                                            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-[#F4B400] transition-colors text-sm font-bold text-[#0F172A]">
                                                <option value="employee">Agent</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setShowModal(false)} className="w-1/3 py-3.5 rounded-xl border-2 border-slate-200 font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                                        <button type="submit" disabled={isCreating} className="w-2/3 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors bg-[#171C2D] text-[#F4B400] hover:bg-[#F4B400] hover:text-[#171C2D] disabled:opacity-50 shadow-md">
                                            {isCreating ? 'Provisioning...' : 'Create Record'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </AdminLayout>
    );
}
