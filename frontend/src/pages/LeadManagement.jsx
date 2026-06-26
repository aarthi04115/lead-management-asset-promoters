import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Notification from "../components/Notification";
import { useNotify } from "../hooks/useNotify";
import { formatDate } from "../utils/formatters";
import api from "../api";

const LeadManagement = () => {
    const { notification, notify } = useNotify();
    const [leads, setLeads] = useState([]);
    const [isFetching, setIsFetching] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [newLead, setNewLead] = useState({
        name: "",
        email: "",
        phone: "",
        property: "",
        source: "Website",
        notes: ""
    });

    const fetchLeads = async () => {
        try {
            setIsFetching(true);
            const { data } = await api.get("/leads");
            setLeads(data.data);
        } catch (err) {
            notify("error", "Failed to fetch leads");
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleAddLead = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const { data } = await api.post("/leads", newLead);
            setLeads([data.data, ...leads]);
            setShowAddModal(false);
            setNewLead({ name: "", email: "", phone: "", property: "", source: "Website", notes: "" });
            notify("success", "Lead created successfully");
        } catch (err) {
            notify("error", err.response?.data?.message || "Failed to create lead");
        } finally {
            setIsSubmitting(false);
        }
    };

    const openLeadModal = (lead) => {
        setSelectedLead(lead);
        setActiveTab("overview");
    };

    const closeLeadModal = () => {
        setSelectedLead(null);
    };

    return (
        <AdminLayout>
            <div className="max-w-[1440px] mx-auto p-lg">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-md">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-900">Lead Management</h2>
                        <p className="text-slate-500 text-lg">Oversee and nurture your property pipeline</p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-lg py-sm bg-white border border-slate-300 text-slate-700 font-bold rounded-lg flex items-center hover:bg-slate-50 transition-all"
                        >
                            <span className="material-symbols-outlined mr-2">person_add</span>
                            Add Lead
                        </button>
                    </div>
                </div>

                <Notification notification={notification} />

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg mb-xl">
                    <StatCard icon="groups" label="Total Leads" value={leads.length} color="bg-primary-container text-secondary-fixed" />
                    <StatCard icon="new_releases" label="New Leads" value={leads.filter(l => l.status === 'New').length} color="bg-blue-50 text-blue-600" />
                    <StatCard icon="favorite" label="Interested" value={leads.filter(l => l.status === 'Interested').length} color="bg-amber-50 text-amber-600" />
                    <StatCard icon="verified" label="Closed" value={leads.filter(l => l.status === 'Sold').length} color="bg-green-50 text-green-600" />
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-md rounded-xl shadow-sm border border-slate-200 mb-lg flex flex-wrap gap-md items-end">
                    <div className="flex-1 min-w-[240px]">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Search Customer</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:border-primary-container focus:ring-1 focus:ring-primary-container outline-none transition-all"
                                placeholder="Name, Email or Phone"
                                type="text"
                            />
                        </div>
                    </div>
                    <FilterSelect label="Status" options={["All Statuses", "New", "Connected", "Interested", "Negotiation", "Sold"]} />
                    <FilterSelect label="Source" options={["All Sources", "Website", "Referral", "Zillow", "Social Media"]} />
                </div>

                {/* Lead Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[400px]">
                    {isFetching ? (
                        <div className="flex items-center justify-center p-20 flex-col gap-4 text-slate-400 font-bold">
                            <div className="w-10 h-10 border-4 border-slate-200 border-t-primary-container rounded-full animate-spin"></div>
                            Loading Leads...
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="flex items-center justify-center p-20 flex-col gap-4 text-slate-400">
                            <span className="material-symbols-outlined text-6xl">person_off</span>
                            <p className="font-bold">No leads found in the system.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-lg py-md text-sm font-bold text-slate-800">Lead ID</th>
                                        <th className="px-lg py-md text-sm font-bold text-slate-800">Customer Name</th>
                                        <th className="px-lg py-md text-sm font-bold text-slate-800">Contact Details</th>
                                        <th className="px-lg py-md text-sm font-bold text-slate-800 text-center">Status</th>
                                        <th className="px-lg py-md text-sm font-bold text-slate-800 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {leads.map((lead) => (
                                        <tr
                                            key={lead._id}
                                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                                            onClick={() => openLeadModal(lead)}
                                        >
                                            <td className="px-lg py-md text-sm font-medium text-slate-500">{lead.leadId}</td>
                                            <td className="px-lg py-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">{lead.name?.charAt(0).toUpperCase()}</div>
                                                    <span className="font-bold text-slate-900">{lead.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-lg py-md">
                                                <p className="text-sm text-slate-700">{lead.phone}</p>
                                                <p className="text-xs text-slate-400">{lead.email}</p>
                                            </td>
                                            <td className="px-lg py-md text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(lead.status)} text-white`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-lg py-md text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1 hover:text-primary-container"><span className="material-symbols-outlined text-lg">edit</span></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Lead Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden p-8" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Add New Lead</h3>
                            <button onClick={() => setShowAddModal(false)} className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddLead} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" required placeholder="Name" value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm" />
                                <input type="email" required placeholder="Email" value={newLead.email} onChange={(e) => setNewLead({ ...newLead, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="text" required placeholder="Phone" value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm" />
                                <select value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm">
                                    <option value="Website">Website</option>
                                    <option value="Referral">Referral</option>
                                    <option value="Social Media">Social Media</option>
                                </select>
                            </div>
                            <input type="text" required placeholder="Property Interest" value={newLead.property} onChange={(e) => setNewLead({ ...newLead, property: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm" />
                            <textarea rows="3" value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none text-sm resize-none" placeholder="Notes..."></textarea>
                            <button type="submit" disabled={isSubmitting} className="w-full bg-primary-container text-white py-4 rounded-xl font-bold hover:opacity-95 transition-all disabled:opacity-50">
                                {isSubmitting ? 'Processing...' : 'Register New Lead'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Lead Detail Modal */}
            {selectedLead && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeLeadModal}></div>
                    <div className="relative w-[90vw] max-w-5xl h-[80vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-lg border-b border-slate-200 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary-container text-secondary-fixed flex items-center justify-center font-bold text-xl">{selectedLead.name?.charAt(0).toUpperCase()}</div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900">{selectedLead.name}</h4>
                                    <p className="text-xs text-slate-400">Lead ID: {selectedLead.leadId} • Registered {formatDate(selectedLead.createdAt)}</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-center">
                                <span className={`px-4 py-1 rounded-full text-sm font-bold ${getStatusColor(selectedLead.status)} text-white`}>{selectedLead.status}</span>
                                <button className="p-2 hover:bg-slate-100 rounded-full transition-colors" onClick={closeLeadModal}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-1 overflow-hidden">
                            <div className="w-48 border-r border-slate-200 bg-slate-50 flex flex-col p-4 gap-2">
                                <TabButton name="overview" label="Overview" icon="info" active={activeTab} onClick={setActiveTab} />
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto bg-white">
                                {activeTab === "overview" && <LeadOverview lead={selectedLead} />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white p-lg rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
            <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
            <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
    </div>
);

const FilterSelect = ({ label, options }) => (
    <div className="w-48">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
        <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none appearance-none bg-no-repeat bg-[right_8px_center]">
            {options.map((opt) => <option key={opt}>{opt}</option>)}
        </select>
    </div>
);

const TabButton = ({ name, label, icon, active, onClick }) => (
    <button onClick={() => onClick(name)} className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left ${active === name ? "bg-slate-200 text-primary-container font-bold" : "text-slate-500 font-medium hover:bg-slate-100"}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
        <span className="text-sm">{label}</span>
    </button>
);

const LeadOverview = ({ lead }) => (
    <div className="grid grid-cols-2 gap-8">
        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email</p><p className="text-sm font-semibold">{lead.email}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Phone</p><p className="text-sm font-semibold">{lead.phone}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Property</p><p className="text-sm font-semibold">{lead.property}</p></div>
        <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Source</p><p className="text-sm font-semibold">{lead.source}</p></div>
    </div>
);

const getStatusColor = (status) => {
    switch (status) {
        case "Negotiation": return "bg-blue-500";
        case "Interested": return "bg-green-500";
        case "New": return "bg-slate-400";
        case "Sold": return "bg-green-600";
        default: return "bg-slate-500";
    }
};

export default LeadManagement;
