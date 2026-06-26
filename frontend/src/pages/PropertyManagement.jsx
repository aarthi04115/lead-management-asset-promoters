import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import Notification from "../components/Notification";
import PropertyModal from "../components/property/PropertyModal";
import PropertyFormModal from "../components/property/PropertyFormModal";
import { useNotify } from "../hooks/useNotify";
import api from "../api";
import {
    Plus, Box, CheckCircle2, Lock, Handshake, AlertCircle,
    MapPin, Banknote, LayoutGrid, List, Key
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export default function PropertyManagement() {
    const { notification, notify } = useNotify();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [apiError, setApiError] = useState(null);

    const [view, setView] = useState("grid");
    const [locationFilter, setLocationFilter] = useState("All Locations");
    const [priceFilter, setPriceFilter] = useState("Price Range");
    const [searchQuery, setSearchQuery] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [editingProperty, setEditingProperty] = useState(null);

    const loadProperties = async () => {
        try {
            setLoading(true);
            setApiError(null);
            const { data } = await api.get("/properties");
            setProperties(data.data);
        } catch (err) {
            setApiError("Cannot reach the backend. Is the server running on port 5000?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProperties();
    }, []);

    const locations = ["All Locations", ...Array.from(new Set(properties.map(p => p.location).filter(Boolean)))].sort();
    const priceRanges = ["Price Range", "₹1Cr - ₹5Cr", "₹5Cr - ₹20Cr", "₹20Cr+"];

    const parsePriceCr = (price) => {
        if (!price) return 0;
        const cleaned = price.replace(/[,\s$₹]/g, "");
        const num = parseFloat(cleaned);
        if (price.toLowerCase().includes('cr')) return num;
        if (price.toLowerCase().includes('m')) return num * 8.3;
        if (price.toLowerCase().includes('l')) return num / 100;
        return isNaN(num) ? 0 : num / 10000000;
    };

    const filteredProperties = properties.filter((p) => {
        const matchesLocation = locationFilter === "All Locations" || p.location.includes(locationFilter);
        const matchesSearch = searchQuery.trim() === "" || p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.location.toLowerCase().includes(searchQuery.toLowerCase());
        let matchesPrice = true;
        if (priceFilter !== "Price Range") {
            const priceCr = parsePriceCr(p.price);
            if (priceFilter === "₹1Cr - ₹5Cr") matchesPrice = priceCr >= 1 && priceCr < 5;
            else if (priceFilter === "₹5Cr - ₹20Cr") matchesPrice = priceCr >= 5 && priceCr < 20;
            else if (priceFilter === "₹20Cr+") matchesPrice = priceCr >= 20;
        }
        return matchesLocation && matchesSearch && matchesPrice;
    });

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete property reference "${title}"?`)) return;
        try {
            await api.delete(`/properties/${id}`);
            setProperties(prev => prev.filter(p => p._id !== id));
            setSelectedProperty(null);
            notify("success", "Property identity removed sequence");
        } catch (err) {
            notify("error", "Deletion failed.");
        }
    };

    const handleCreateOrUpdateProperty = async (payload) => {
        try {
            if (editingProperty) {
                const { data } = await api.put(`/properties/${editingProperty._id}`, payload);
                setProperties(prev => prev.map(p => p._id === editingProperty._id ? data.data : p));
                notify("success", "Property updated gracefully.");
            } else {
                const { data } = await api.post("/properties", payload);
                setProperties(prev => [data.data, ...prev]);
                notify("success", "Property registered successfully.");
            }
            setShowAddModal(false);
            setEditingProperty(null);
        } catch (err) {
            notify("error", err.response?.data?.message || "Failed to submit property.");
            throw err; // Form spinner stops but modal stays open
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case "Available": return "bg-green-100 text-green-700";
            case "Booked": return "bg-red-100 text-red-700";
            case "Negotiation": return "bg-blue-100 text-blue-700";
            case "Sold": return "bg-slate-200 text-slate-700";
            default: return "bg-slate-100 text-slate-600";
        }
    };

    return (
        <AdminLayout>
            <div className="p-4 sm:p-8 pb-24 max-w-[1720px] mx-auto min-h-screen bg-[#F8F9FF] font-['Poppins',sans-serif]">
                <Notification notification={notification} />

                {/* Page Header matching LuxeCRM */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[#0B1C30] tracking-tight">Property Management</h1>
                        <p className="text-sm text-[#75777E] mt-1">Oversee your global inventory and high-end listings.</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-[#FFE088] text-[#735C00] rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
                    >
                        <Plus size={18} /> Add Property
                    </button>
                </div>

                {/* Specific 4-Card Stats Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_4px_20px_rgba(8,21,46,0.05)] border-l-[5px] border-[#0B1C30] flex flex-col justify-between h-[130px]">
                        <div>
                            <Box size={24} className="mb-2 text-[#0B1C30]" />
                            <p className="text-[10px] font-semibold text-[#75777E] uppercase tracking-widest">Total Properties</p>
                        </div>
                        <h3 className="text-3xl font-semibold text-[#0B1C30] mt-2">{properties.length || "—"}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_4px_20px_rgba(8,21,46,0.05)] border-l-[5px] border-[#735C00] flex flex-col justify-between h-[130px]">
                        <div>
                            <CheckCircle2 size={24} className="mb-2 text-[#735C00]" />
                            <p className="text-[10px] font-semibold text-[#75777E] uppercase tracking-widest">Available</p>
                        </div>
                        <h3 className="text-3xl font-semibold text-[#0B1C30] mt-2">{properties.filter(p => p.status === 'Available').length || "—"}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_4px_20px_rgba(8,21,46,0.05)] border-l-[5px] border-[#BA1A1A] flex flex-col justify-between h-[130px]">
                        <div>
                            <Lock size={24} className="mb-2 text-[#BA1A1A]" />
                            <p className="text-[10px] font-semibold text-[#75777E] uppercase tracking-widest">Booked</p>
                        </div>
                        <h3 className="text-3xl font-semibold text-[#0B1C30] mt-2">{properties.filter(p => p.status === 'Booked').length || "—"}</h3>
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-[0_4px_20px_rgba(8,21,46,0.05)] border-l-[5px] border-[#525E7B] flex flex-col justify-between h-[130px]">
                        <div>
                            <Handshake size={24} className="mb-2 text-[#525E7B]" />
                            <p className="text-[10px] font-semibold text-[#75777E] uppercase tracking-widest">Negotiation</p>
                        </div>
                        <h3 className="text-3xl font-semibold text-[#0B1C30] mt-2">{properties.filter(p => p.status === 'Negotiation').length || "—"}</h3>
                    </div>
                </section>

                {/* API Error Red Banner matching Screenshot */}
                {apiError && (
                    <div className="mb-6 rounded-lg border border-red-300 bg-[#FFDAD6] px-4 py-3 text-[#93000A] text-sm flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-2 font-medium">
                            <AlertCircle size={18} />
                            {apiError}
                        </div>
                        <button onClick={loadProperties} className="underline text-xs font-semibold text-[#BA1A1A]">Retry</button>
                    </div>
                )}

                {/* Filter Toolbar (White Pill style) */}
                <section className="bg-white p-4 rounded-xl shadow-[0_4px_20px_rgba(8,21,46,0.05)] mb-8 flex flex-wrap items-center justify-between gap-4 border border-[#c5c6ce]/30">
                    <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                        <div className="flex items-center gap-2 bg-[#F8F9FF] px-4 py-2 rounded-lg border border-[#c5c6ce] w-full sm:w-auto">
                            <MapPin size={18} className="text-[#75777E]" />
                            <select
                                value={locationFilter} onChange={e => setLocationFilter(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm text-[#45464D] min-w-[140px] w-full outline-none font-medium"
                            >
                                {locations.map(loc => <option key={loc}>{loc}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-2 bg-[#F8F9FF] px-4 py-2 rounded-lg border border-[#c5c6ce] w-full sm:w-auto">
                            <Banknote size={18} className="text-[#75777E]" />
                            <select
                                value={priceFilter} onChange={e => setPriceFilter(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm text-[#45464D] min-w-[140px] w-full outline-none font-medium"
                            >
                                {priceRanges.map(range => <option key={range}>{range}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <p className="text-xs text-[#75777E] font-medium tracking-wide">showing {filteredProperties.length} of {properties.length}</p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setView('grid')} className={cn("p-2 rounded-lg transition-colors", view === 'grid' ? "bg-[#DCE9FF] text-[#0B1C30]" : "text-[#75777E] hover:bg-[#F8F9FF]")}>
                                <LayoutGrid size={20} />
                            </button>
                            <button onClick={() => setView('list')} className={cn("p-2 rounded-lg transition-colors", view === 'list' ? "bg-[#DCE9FF] text-[#0B1C30]" : "text-[#75777E] hover:bg-[#F8F9FF]")}>
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* Empty State / Grid Content */}
                {loading ? (
                    <div className="w-full flex justify-center py-24">
                        <p className="text-[#75777E] font-medium text-sm flex items-center gap-2 animate-pulse">Syncing catalog...</p>
                    </div>
                ) : filteredProperties.length === 0 ? (
                    <div className="bg-white rounded-2xl w-full h-[400px] flex flex-col items-center justify-center shadow-[0_4px_20px_rgba(8,21,46,0.05)] border border-[#c5c6ce]/30">
                        <Key size={32} className="text-[#75777E] mb-3" />
                        <p className="text-sm font-medium text-[#75777E]">No properties match your filters.</p>
                    </div>
                ) : (
                    <div className={cn(view === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4")}>
                        {filteredProperties.map(p => (
                            <div key={p._id} onClick={() => setSelectedProperty(p)} className={cn("bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-[#c5c6ce]/30 cursor-pointer transition-shadow", view === 'list' && "flex items-center")}>
                                <div className={cn("relative", view === 'grid' ? "h-48 w-full" : "h-32 w-48 shrink-0")}>
                                    <img src={p.image || (p.images && p.images[0]) || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750"} alt={p.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-3 left-3">
                                        <span className={cn("px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest", getStatusStyle(p.status))}>
                                            {p.status}
                                        </span>
                                    </div>
                                </div>
                                <div className={cn("p-5 flex flex-col justify-between", view === 'grid' ? "h-auto" : "w-full")}>
                                    <div>
                                        <p className="text-[10px] font-bold text-[#525E7B] uppercase tracking-widest mb-1">{p.type}</p>
                                        <h4 className="text-[15px] font-semibold text-[#0B1C30] line-clamp-1 mb-1">{p.title}</h4>
                                        <div className="flex items-center gap-1 text-[11px] text-[#75777E] font-medium mb-4">
                                            <MapPin size={12} /> {p.location}
                                        </div>
                                    </div>
                                    <div className="border-t border-[#eff4ff] pt-3 mt-auto">
                                        <span className="text-[17px] font-bold text-[#0B1C30]">{p.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Property Modal Inspector */}
                {selectedProperty && (
                    <PropertyModal
                        property={selectedProperty}
                        onClose={() => setSelectedProperty(null)}
                        onEdit={() => {
                            setEditingProperty(selectedProperty);
                            setSelectedProperty(null);
                        }}
                        onDelete={() => handleDelete(selectedProperty._id, selectedProperty.title)}
                    />
                )}

                {/* Property Form Modal */}
                {(showAddModal || editingProperty) && (
                    <PropertyFormModal
                        mode={editingProperty ? "edit" : "create"}
                        initialProperty={editingProperty}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingProperty(null);
                        }}
                        onSubmit={handleCreateOrUpdateProperty}
                    />
                )}
            </div>
        </AdminLayout>
    );
}
