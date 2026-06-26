import React, { useState, useEffect } from "react";
import { Property } from "../types";

type TabId = "overview" | "amenities" | "documents" | "gallery";

interface PropertyModalProps {
  property: Property | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: () => void;
  onDownload: (docName: string) => void;
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  property,
  onClose,
  onEdit,
  onDelete,
  onUpload,
  onDownload,
}) => {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (property) { setActiveTab("overview"); setActiveImage(0); }
  }, [property]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (property) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [property, onClose]);

  if (!property) return null;

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "amenities", label: "Amenities" },
    { id: "documents", label: "Documents" },
    { id: "gallery", label: "Gallery" },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 glass-overlay" onClick={onClose} />

      <div className="relative bg-surface-container-lowest w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto rounded-2xl custom-shadow-l3 border border-outline-variant/30 flex flex-col md:flex-row">

        {/* Left: image + thumbnails */}
        <div className="w-full md:w-2/5 flex-shrink-0 flex flex-col">
          <div className="relative h-56 sm:h-64 md:h-72 flex-shrink-0">
            {property.images.length > 0 ? (
              <img
                src={property.images[activeImage]}
                alt={property.imageAlt || property.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                <span className="material-symbols-outlined text-[48px] text-outline">image_not_supported</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary-container/60 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-xl sm:text-2xl font-semibold text-white">{property.title}</h3>
              <p className="text-[#ffe088] text-sm sm:text-base">{property.location}</p>
            </div>
          </div>
          {property.images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-surface-container-low">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeImage ? "border-secondary" : "border-transparent"
                  }`}
                >
                  <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: tabs + content */}
        <div className="w-full md:w-3/5 p-5 sm:p-8 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-3 sm:gap-4 border-b border-outline-variant overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={
                    activeTab === tab.id
                      ? "pb-4 text-sm font-semibold text-black border-b-2 border-secondary transition-all whitespace-nowrap"
                      : "pb-4 text-sm font-semibold text-outline hover:text-black transition-all whitespace-nowrap"
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center bg-surface-container-low text-black hover:bg-error/10 hover:text-error transition-all ml-2"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <p className="text-xs text-outline uppercase tracking-widest mb-1">Description</p>
                <p className="text-base text-on-surface-variant leading-relaxed">
                  {property.description || "No description provided."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-outline uppercase tracking-widest mb-1">Asking Price</p>
                  <p className="text-2xl font-semibold text-black">{property.price}</p>
                </div>
                <div>
                  <p className="text-xs text-outline uppercase tracking-widest mb-1">Lot Size</p>
                  <p className="text-2xl font-semibold text-black">{property.lotSize || "—"}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                  <p className="text-xs text-outline uppercase tracking-widest mb-1">Category</p>
                  <p className="text-sm font-semibold text-black">{property.category}</p>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20">
                  <p className="text-xs text-outline uppercase tracking-widest mb-1">Status</p>
                  <p className={`text-sm font-semibold ${
                    property.status === "Available" ? "text-green-600" :
                    property.status === "Booked" ? "text-red-600" : "text-amber-600"
                  }`}>{property.status}</p>
                </div>
              </div>
            </div>
          )}

          {/* AMENITIES */}
          {activeTab === "amenities" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {property.amenities.length === 0 && (
                <p className="text-sm text-outline col-span-2">No amenities listed.</p>
              )}
              {property.amenities.map((amenity, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-secondary">{amenity.icon}</span>
                  <span className="text-base text-on-surface">{amenity.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* DOCUMENTS */}
          {activeTab === "documents" && (
            <div className="space-y-4">
              {property.documents.length === 0 && (
                <p className="text-sm text-outline">No documents uploaded yet.</p>
              )}
              {property.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white border border-outline-variant rounded-lg gap-2">
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`material-symbols-outlined flex-shrink-0 ${doc.iconColor === "error" ? "text-error" : "text-black"}`}>
                      {doc.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-black truncate">{doc.name}</p>
                      <p className="text-xs text-outline">{doc.size} • {doc.meta}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDownload(doc.name)}
                    title={doc.fileData ? `Download ${doc.name}` : "No file data — re-upload to enable download"}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold flex-shrink-0 transition-all ${
                      doc.fileData
                        ? "bg-primary-container text-white hover:opacity-90 cursor-pointer"
                        : "bg-surface-container-low text-outline cursor-not-allowed opacity-60"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    Download
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={onUpload}
                className="w-full mt-4 border-2 border-dashed border-outline-variant p-6 rounded-xl flex flex-col items-center justify-center text-outline hover:text-black hover:border-black transition-all"
              >
                <span className="material-symbols-outlined text-[32px] mb-1">upload_file</span>
                <span className="text-sm font-semibold">Upload New Brochure</span>
              </button>
            </div>
          )}

          {/* GALLERY */}
          {activeTab === "gallery" && (
            <div>
              {property.images.length === 0 ? (
                <p className="text-sm text-outline">No images uploaded yet.</p>
              ) : (
                <>
                  <div className="mb-3 rounded-xl overflow-hidden shadow-sm aspect-video">
                    <img
                      src={property.images[activeImage]}
                      alt={`Gallery ${activeImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {property.images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImage(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                          idx === activeImage ? "border-secondary shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Footer buttons */}
          <div className="mt-auto pt-8 border-t border-outline-variant/30 flex gap-4">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-white py-4 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">edit</span>
              Edit Property
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label="Delete property"
              className="w-14 h-11 flex items-center justify-center border border-error text-error rounded-lg hover:bg-error hover:text-white transition-all"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyModal;
