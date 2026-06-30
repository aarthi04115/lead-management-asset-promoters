import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Image as ImageIcon, UploadCloud } from "lucide-react";

const propertyCategories = ["Residential", "Commercial", "Resort", "Historic"];
const amenityIconMap = {
    "Pool": "pool", "Gym": "fitness_center", "Spa": "spa",
    "Garden": "yard", "Garage": "garage", "Smart Home": "smart_button",
    "Security": "security", "Ocean View": "water", "Theater": "theaters"
};

export default function PropertyFormModal({ mode, initialProperty, onClose, onSubmit }) {
    const [values, setValues] = useState({
        title: "", description: "", price: "", location: "",
        category: "Residential", status: "Available", lotSize: "",
        images: [], brochureName: null, brochureData: null, amenities: []
    });

    const [amenityInput, setAmenityInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const imageInputRef = useRef(null);
    const brochureInputRef = useRef(null);

    useEffect(() => {
        if (initialProperty) {
            setValues({
                title: initialProperty.title || "",
                description: initialProperty.description || "",
                price: initialProperty.price || "",
                location: initialProperty.location || "",
                category: initialProperty.type || "Residential",
                status: initialProperty.status || "Available",
                lotSize: initialProperty.area || "",
                images: initialProperty.images?.length > 0 ? initialProperty.images : (initialProperty.image ? [initialProperty.image] : []),
                brochureName: initialProperty.brochure || null,
                brochureData: null, // Existing document data not loaded to DOM to save memory, only URLs
                amenities: initialProperty.amenities || []
            });
        }
    }, [initialProperty]);

    const updateField = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

    const handleImageFiles = (files) => {
        if (!files || files.length === 0) return;
        const readers = Array.from(files).map((file) => new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(file);
        }));
        Promise.all(readers).then(dataUrls => setValues(prev => ({ ...prev, images: [...prev.images, ...dataUrls] })));
    };

    const removeImage = (idx) => setValues(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));

    const handleBrochureFile = (files) => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const reader = new FileReader();
        reader.onload = () => {
            updateField("brochureName", file.name);
            updateField("brochureData", reader.result);
        };
        reader.readAsDataURL(file);
    };

    const addAmenity = () => {
        const trimmed = amenityInput.trim();
        if (trimmed && !values.amenities.includes(trimmed)) {
            updateField("amenities", [...values.amenities, trimmed]);
        }
        setAmenityInput("");
    };

    const removeAmenity = (label) => updateField("amenities", values.amenities.filter(a => a !== label));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Map form category to MongoDB 'type' payload
        const payload = {
            ...values,
            type: values.category,
            area: values.lotSize || 0,
            image: values.images[0] || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            brochure: values.brochureData || values.brochureName // store base64 or keep old name text
        };
        await onSubmit(payload);
        setIsSubmitting(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-['Poppins',sans-serif] p-4">
            <div className="absolute inset-0 bg-[#0B1C30]/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                <div className="flex justify-between items-center p-6 border-b border-[#eff4ff]">
                    <h3 className="text-xl font-semibold text-[#0B1C30]">{mode === "create" ? "Add Property" : "Edit Property"}</h3>
                    <button onClick={onClose} type="button" className="w-8 h-8 flex items-center justify-center text-[#75777E] hover:bg-[#F8F9FF] rounded-full transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="propertyFormLogic" onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">PROPERTY NAME</label>
                            <input required type="text" placeholder="e.g. Azure Haven Estate" value={values.title} onChange={e => updateField("title", e.target.value)} className="w-full bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none focus:border-[#525E7B] transition-colors" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">DESCRIPTION</label>
                            <textarea required placeholder="Describe the property..." value={values.description} onChange={e => updateField("description", e.target.value)} className="w-full bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none focus:border-[#525E7B] transition-colors h-24 resize-none" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">PRICE</label>
                                <input required type="text" placeholder="e.g. $12,450,000" value={values.price} onChange={e => updateField("price", e.target.value)} className="w-full bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none focus:border-[#525E7B] transition-colors" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">LOCATION</label>
                                <input required type="text" placeholder="e.g. Beverly Hills, CA" value={values.location} onChange={e => updateField("location", e.target.value)} className="w-full bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none focus:border-[#525E7B] transition-colors" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">CATEGORY</label>
                                <select value={values.category} onChange={e => updateField("category", e.target.value)} className="w-full bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none focus:border-[#525E7B] transition-colors">
                                    {propertyCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">STATUS</label>
                                <select value={values.status} onChange={e => updateField("status", e.target.value)} className="w-full bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none focus:border-[#525E7B] transition-colors">
                                    <option value="Available">Available</option>
                                    <option value="Negotiation">Negotiation</option>
                                    <option value="Booked">Booked</option>
                                    <option value="Sold">Sold</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">LOT SIZE</label>
                                <input type="text" placeholder="e.g. 1.2 Acres" value={values.lotSize} onChange={e => updateField("lotSize", e.target.value)} className="w-full bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none focus:border-[#525E7B] transition-colors" />
                            </div>
                        </div>

                        {/* Interactive File Dropzone for Gallery */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">IMAGES (PROPERTY GALLERY)</label>
                            {values.images.length > 0 && (
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {values.images.map((img, idx) => (
                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#c5c6ce] group shrink-0">
                                            <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageFiles(e.target.files)} />
                            <div onClick={() => imageInputRef.current?.click()} className="w-full h-24 border-2 border-dashed border-[#c5c6ce] rounded-xl flex flex-col items-center justify-center bg-[#F8F9FF] hover:bg-[#eff4ff] cursor-pointer transition-colors group">
                                <ImageIcon size={24} className="text-[#a0a7b8] group-hover:scale-110 transition-transform mb-1" />
                                <span className="text-xs font-semibold text-[#75777E]">Add Image</span>
                            </div>
                        </div>

                        {/* Brochure File Picker */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">BROCHURE PDF</label>
                            <input ref={brochureInputRef} type="file" accept="application/pdf" className="hidden" onChange={e => handleBrochureFile(e.target.files)} />
                            {values.brochureName ? (
                                <div className="flex items-center justify-between p-3 bg-[#F8F9FF] border border-[#c5c6ce] rounded-xl">
                                    <span className="text-[13px] font-semibold text-[#0B1C30] truncate">{values.brochureName}</span>
                                    <button type="button" onClick={() => { updateField("brochureName", null); updateField("brochureData", null); }} className="text-[#BA1A1A] hover:bg-[#FFDAD6] p-1 rounded-md transition-colors"><X size={16} /></button>
                                </div>
                            ) : (
                                <div onClick={() => brochureInputRef.current?.click()} className="w-full p-4 border-2 border-[#c5c6ce]/50 rounded-xl flex items-center justify-center bg-[#ffffff] hover:bg-[#F8F9FF] cursor-pointer transition-colors gap-2 text-[#75777E] text-[13px] font-semibold border-dashed">
                                    <UploadCloud size={16} /> Upload Brochure PDF
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-[9px] font-semibold text-[#75777E] uppercase tracking-widest pl-1">AMENITIES</label>
                            <div className="flex bg-[#F8F9FF] border border-[#c5c6ce]/50 rounded-xl overflow-hidden focus-within:border-[#525E7B]">
                                <input type="text" placeholder="e.g. Infinity Pool - press Enter to add" value={amenityInput} onChange={e => setAmenityInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAmenity(); } }} className="flex-1 bg-transparent px-4 py-3 text-[13px] font-medium text-[#0B1C30] outline-none" />
                                <button type="button" onClick={addAmenity} className="bg-[#0B1C30] text-white px-5 text-xs font-semibold hover:bg-[#525E7B] transition-colors">Add</button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-3 pt-1">
                                {values.amenities.map(tag => (
                                    <span key={tag} className="flex items-center gap-1.5 bg-[#eff4ff] text-[#0B1C30] border border-[#c5c6ce]/40 px-3 py-1.5 rounded-[8px] text-[11px] font-semibold shadow-sm">
                                        {tag} <button type="button" onClick={() => removeAmenity(tag)} className="hover:text-[#BA1A1A]"><X size={12} /></button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-[#eff4ff] bg-[#F8F9FF] flex gap-4">
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-[#c5c6ce] font-semibold text-[13px] text-[#0B1C30] hover:bg-[#eff4ff] transition-colors bg-white">Cancel</button>
                    <button type="submit" form="propertyFormLogic" disabled={isSubmitting} className="flex-1 py-3.5 rounded-xl font-semibold text-[13px] transition-colors bg-[#FFE088] text-[#735C00] hover:opacity-90 disabled:opacity-50">
                        {isSubmitting ? "Processing..." : (mode === "create" ? "Create Property" : "Save Changes")}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
