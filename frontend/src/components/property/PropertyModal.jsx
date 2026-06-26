import { useState, useEffect } from "react";
import { X, Edit, Trash2, MapPin, Download, UploadCloud, CheckCircle2, Calendar } from "lucide-react";

export default function PropertyModal({ property, onClose, onEdit, onDelete }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        if (property) { setActiveTab("overview"); setActiveImage(0); }
    }, [property]);

    if (!property) return null;

    const tabs = [
        { id: "overview", label: "Overview" },
        { id: "amenities", label: "Amenities" },
        { id: "documents", label: "Documents" },
        { id: "gallery", label: "Gallery" }
    ];

    const images = property.images && property.images.length > 0 ? property.images : (property.image ? [property.image] : []);

    const amenityIconMap = {
        "Pool": "🌊", "Gym": "🏋️", "Spa": "💆",
        "Garden": "🪴", "Garage": "🚗", "Smart Home": "🏠",
        "Security": "🛡️", "Ocean View": "🌊", "Theater": "🎬"
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 font-['Poppins',sans-serif]">
            <div className="absolute inset-0 bg-[#0B1C30]/40 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row">

                {/* Left side Image Gallery */}
                <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col">
                    <div className="relative h-56 sm:h-64 md:h-72 flex-shrink-0 bg-[#F8F9FF]">
                        {images.length > 0 ? (
                            <img src={images[activeImage]} alt={property.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#c5c6ce]">No Image Available</div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1b34]/80 to-transparent" />
                        <div className="absolute bottom-6 left-6">
                            <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 leading-tight">{property.title}</h3>
                            <p className="text-[#ffe088] text-sm flex items-center gap-1 font-medium"><MapPin size={14} /> {property.location}</p>
                        </div>
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-2 p-3 overflow-x-auto bg-[#eff4ff]">
                            {images.map((img, idx) => (
                                <button key={idx} onClick={() => setActiveImage(idx)} className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${idx === activeImage ? "border-[#735C00]" : "border-transparent"}`}>
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right side Tabs */}
                <div className="w-full md:w-3/5 p-5 sm:p-8 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex gap-3 sm:gap-6 border-b border-[#eff4ff] overflow-x-auto w-full">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? "text-[#0B1C30] border-b-2 border-[#735C00]" : "text-[#75777E] hover:text-[#0B1C30]"}`}>
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                        <button onClick={onClose} className="ml-4 w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center bg-[#F8F9FF] text-[#75777E] hover:bg-[#FFDAD6] hover:text-[#BA1A1A] transition-all">
                            <X size={16} />
                        </button>
                    </div>

                    {/* OVERVIEW */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            <div>
                                <p className="text-[10px] text-[#75777E] uppercase tracking-widest mb-2 font-semibold">Description</p>
                                <p className="text-[13px] text-[#45464D] leading-relaxed font-medium">{property.description || "No description provided."}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-[#75777E] uppercase tracking-widest mb-1 font-semibold">Asking Price</p>
                                    <p className="text-2xl font-bold text-[#0B1C30]">{property.price}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-[#75777E] uppercase tracking-widest mb-1 font-semibold">Lot Size</p>
                                    <p className="text-2xl font-bold text-[#0B1C30]">{property.area || "—"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#c5c6ce]/30">
                                    <p className="text-[10px] text-[#75777E] uppercase tracking-widest mb-1 font-semibold">Category</p>
                                    <p className="text-[13px] font-bold text-[#0B1C30]">{property.type}</p>
                                </div>
                                <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#c5c6ce]/30">
                                    <p className="text-[10px] text-[#75777E] uppercase tracking-widest mb-1 font-semibold">Status</p>
                                    <p className={`text-[13px] font-bold ${property.status === 'Available' ? 'text-green-600' : property.status === 'Booked' ? 'text-red-600' : 'text-blue-600'}`}>{property.status}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AMENITIES */}
                    {activeTab === "amenities" && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {!property.amenities || property.amenities.length === 0 ? (
                                <p className="text-sm text-[#75777E]">No amenities listed.</p>
                            ) : property.amenities.map((amenity, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-[#eff4ff] rounded-xl border border-[#c5c6ce]/30">
                                    <span className="text-lg">{amenityIconMap[amenity] || '✨'}</span>
                                    <span className="text-[13px] font-semibold text-[#0B1C30]">{amenity}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* DOCUMENTS */}
                    {activeTab === "documents" && (
                        <div className="space-y-4">
                            {!property.brochure ? (
                                <p className="text-sm text-[#75777E]">No documents attached.</p>
                            ) : (
                                <div className="flex items-center justify-between p-4 bg-white border border-[#c5c6ce] rounded-xl gap-2 shadow-sm">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <FileText className="text-[#BA1A1A] shrink-0" size={24} />
                                        <div className="min-w-0">
                                            <p className="text-[13px] font-bold text-[#0B1C30] truncate">{property.brochure.length > 500 ? "Brochure.pdf" : property.brochure}</p>
                                            <p className="text-[11px] text-[#75777E] font-medium">Uploaded Document</p>
                                        </div>
                                    </div>
                                    <button onClick={() => {
                                        // Fake download for Base64 testing if data URL format
                                        if (property.brochure.startsWith('data:')) {
                                            const link = document.createElement('a'); link.href = property.brochure; link.download = 'Brochure.pdf'; link.click();
                                        }
                                    }} className="flex items-center gap-2 px-4 py-2 bg-[#0e1b34] text-white rounded-lg text-xs font-bold shrink-0 hover:opacity-90">
                                        <Download size={14} /> Download
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* GALLERY */}
                    {activeTab === "gallery" && (
                        <div>
                            {images.length === 0 ? <p className="text-sm text-[#75777E]">No images uploaded yet.</p> : (
                                <>
                                    <div className="mb-3 rounded-xl overflow-hidden shadow-sm aspect-video">
                                        <img src={images[activeImage]} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                        {images.map((img, idx) => (
                                            <button key={idx} onClick={() => setActiveImage(idx)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${idx === activeImage ? "border-[#735C00] shadow-md" : "border-transparent opacity-70 hover:opacity-100"}`}>
                                                <img src={img} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div className="mt-auto pt-8 border-t border-[#eff4ff] flex gap-4">
                        <button onClick={onEdit} className="flex-1 flex items-center justify-center gap-2 bg-[#0e1b34] text-[#FFE088] py-3.5 rounded-xl text-[13px] font-bold hover:opacity-90 transition-all shadow-sm">
                            <Edit size={16} /> Edit Property
                        </button>
                        <button onClick={onDelete} className="w-14 shrink-0 flex items-center justify-center border border-[#BA1A1A] text-[#BA1A1A] rounded-xl hover:bg-[#BA1A1A] hover:text-white transition-all">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
