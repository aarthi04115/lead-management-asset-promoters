import React, { useEffect, useRef, useState } from "react";
import { Property, PropertyFormValues, PropertyStatus } from "../types";
import { amenityIconMap, defaultAmenityIcon, propertyCategories } from "../data";

interface PropertyFormModalProps {
  mode: "create" | "edit";
  initialProperty: Property | null;
  onClose: () => void;
  onSubmit: (values: PropertyFormValues) => void;
}

const emptyForm: PropertyFormValues = {
  title: "",
  description: "",
  price: "",
  location: "",
  category: propertyCategories[0],
  status: "Available",
  lotSize: "",
  images: [],
  brochureName: null,
  brochureData: null,
  amenities: [],
};

function propertyToFormValues(property: Property): PropertyFormValues {
  return {
    id: property.id,
    title: property.title,
    description: property.description,
    price: property.price,
    location: property.location,
    category: property.category,
    status: property.status,
    lotSize: property.lotSize,
    images: property.images,
    brochureName: property.documents[0]?.name ?? null,
    brochureData: property.documents[0]?.fileData ?? null,
    amenities: property.amenities.map((a) => a.label),
  };
}

const statusOptions: PropertyStatus[] = ["Available", "Negotiation", "Booked"];

const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  mode,
  initialProperty,
  onClose,
  onSubmit,
}) => {
  const [values, setValues] = useState<PropertyFormValues>(
    initialProperty ? propertyToFormValues(initialProperty) : emptyForm
  );
  const [amenityInput, setAmenityInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const brochureInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValues(initialProperty ? propertyToFormValues(initialProperty) : emptyForm);
    setErrors({});
  }, [initialProperty]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const updateField = <K extends keyof PropertyFormValues>(
    key: K,
    value: PropertyFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const readers = Array.from(files).map(
      (file) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        })
    );
    Promise.all(readers).then((dataUrls) => {
      setValues((prev) => ({ ...prev, images: [...prev.images, ...dataUrls] }));
    });
  };

  const removeImage = (index: number) => {
    setValues((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleBrochureFile = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      updateField("brochureName", file.name);
      updateField("brochureData", reader.result as string);
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

  const removeAmenity = (label: string) => {
    updateField(
      "amenities",
      values.amenities.filter((a) => a !== label)
    );
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!values.title.trim()) newErrors.title = "Property name is required.";
    if (!values.description.trim()) newErrors.description = "Description is required.";
    if (!values.price.trim()) newErrors.price = "Price is required.";
    if (!values.location.trim()) newErrors.location = "Location is required.";
    if (values.images.length === 0)
      newErrors.images = "Add at least one property image.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 glass-overlay" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative bg-surface-container-lowest w-full max-w-3xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl custom-shadow-l3 border border-outline-variant/30 p-5 sm:p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl sm:text-2xl font-semibold text-black">
            {mode === "create" ? "Add Property" : "Edit Property"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low text-black hover:bg-error/10 hover:text-error transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-5">
          {/* Property Name */}
          <div>
            <label className="block text-xs text-outline uppercase tracking-widest mb-1">
              Property Name
            </label>
            <input
              type="text"
              value={values.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Azure Haven Estate"
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
            />
            {errors.title && <p className="text-error text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs text-outline uppercase tracking-widest mb-1">
              Description
            </label>
            <textarea
              value={values.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={4}
              placeholder="Describe the property..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none resize-none"
            />
            {errors.description && <p className="text-error text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Price + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-outline uppercase tracking-widest mb-1">Price</label>
              <input
                type="text"
                value={values.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="e.g. $12,450,000"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              />
              {errors.price && <p className="text-error text-xs mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-xs text-outline uppercase tracking-widest mb-1">Location</label>
              <input
                type="text"
                value={values.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="e.g. Beverly Hills, CA"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              />
              {errors.location && <p className="text-error text-xs mt-1">{errors.location}</p>}
            </div>
          </div>

          {/* Category + Status + Lot Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-outline uppercase tracking-widest mb-1">Category</label>
              <select
                value={values.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              >
                {propertyCategories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-outline uppercase tracking-widest mb-1">Status</label>
              <select
                value={values.status}
                onChange={(e) => updateField("status", e.target.value as PropertyStatus)}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              >
                {statusOptions.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-outline uppercase tracking-widest mb-1">Lot Size</label>
              <input
                type="text"
                value={values.lotSize}
                onChange={(e) => updateField("lotSize", e.target.value)}
                placeholder="e.g. 1.2 Acres"
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-xs text-outline uppercase tracking-widest mb-2">
              Images (Property Gallery)
            </label>
            <div className="flex flex-wrap gap-3 mb-3">
              {values.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden border border-outline-variant group">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    aria-label="Remove image"
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] text-center py-0.5">
                      Cover
                    </span>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="w-20 h-20 rounded-lg border-2 border-dashed border-outline-variant flex flex-col items-center justify-center text-outline hover:text-black hover:border-black transition-all"
              >
                <span className="material-symbols-outlined">add_photo_alternate</span>
              </button>
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImageFiles(e.target.files)} />
            {errors.images && <p className="text-error text-xs mt-1">{errors.images}</p>}
          </div>

          {/* Brochure PDF */}
          <div>
            <label className="block text-xs text-outline uppercase tracking-widest mb-2">
              Brochure PDF
            </label>
            {values.brochureName ? (
              <div className="flex items-center justify-between p-3 bg-surface-container-low border border-outline-variant rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="material-symbols-outlined text-error">picture_as_pdf</span>
                  <span className="text-sm text-black truncate">{values.brochureName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { updateField("brochureName", null); updateField("brochureData", null); }}
                  aria-label="Remove brochure"
                  className="text-outline hover:text-error p-1"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => brochureInputRef.current?.click()}
                className="w-full border-2 border-dashed border-outline-variant p-4 rounded-xl flex items-center justify-center gap-2 text-outline hover:text-black hover:border-black transition-all"
              >
                <span className="material-symbols-outlined">upload_file</span>
                <span className="text-sm font-semibold">Upload Brochure PDF</span>
              </button>
            )}
            <input ref={brochureInputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleBrochureFile(e.target.files)} />
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs text-outline uppercase tracking-widest mb-2">Amenities</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
                placeholder="e.g. Infinity Pool — press Enter to add"
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary-container outline-none"
              />
              <button type="button" onClick={addAmenity} className="px-4 py-2 bg-primary-container text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-all">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {values.amenities.map((label) => (
                <span key={label} className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant rounded-full pl-3 pr-2 py-1.5 text-sm text-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    {amenityIconMap[label] ?? defaultAmenityIcon}
                  </span>
                  {label}
                  <button type="button" onClick={() => removeAmenity(label)} className="text-outline hover:text-error">
                    <span className="material-symbols-outlined text-[14px]">close</span>
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant/30 flex gap-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-lg text-sm font-semibold border border-outline-variant text-on-surface-variant hover:bg-surface-variant/10 transition-all">
            Cancel
          </button>
          <button type="submit" className="flex-1 py-3 rounded-lg text-sm font-semibold bg-secondary-container text-[#241a00] hover:opacity-90 transition-all">
            {mode === "create" ? "Create Property" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PropertyFormModal;
