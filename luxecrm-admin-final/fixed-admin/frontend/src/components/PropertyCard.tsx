import React from "react";
import { Property, PropertyStatus } from "../types";

const statusClasses: Record<PropertyStatus, { badge: string; dot: string }> = {
  Available: { badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  Negotiation: { badge: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
  Booked: { badge: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

interface PropertyCardProps {
  property: Property;
  onSelect: (id: string) => void;
  view: "grid" | "list";
}

const Placeholder: React.FC<{ className?: string }> = ({ className }) => (
  <div className={`bg-surface-container flex items-center justify-center ${className ?? ""}`}>
    <span className="material-symbols-outlined text-[36px] text-outline">image_not_supported</span>
  </div>
);

const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, view }) => {
  const status = statusClasses[property.status];
  const coverImage = property.images?.[0] ?? null;

  if (view === "list") {
    return (
      <button
        type="button"
        onClick={() => onSelect(property.id)}
        className="group w-full text-left bg-surface-container-lowest rounded-xl overflow-hidden custom-shadow-l1 border border-outline-variant/20 cursor-pointer hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row"
      >
        <div className="relative w-full sm:w-56 h-40 sm:h-auto flex-shrink-0 overflow-hidden">
          {coverImage ? (
            <img
              src={coverImage}
              alt={property.imageAlt || property.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <Placeholder className="w-full h-full" />
          )}
          <div className="absolute top-2 right-2">
            <span className={`${status.badge} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
              <span className={`w-2 h-2 ${status.dot} rounded-full`} />
              {property.status}
            </span>
          </div>
        </div>
        <div className="p-6 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-secondary tracking-widest uppercase mb-1">{property.category}</p>
            <h4 className="text-xl font-semibold text-black mb-1">{property.title}</h4>
            <div className="flex items-center gap-1 text-outline">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="text-sm">{property.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:min-w-[180px]">
            <p className="text-xl font-semibold text-black">{property.price}</p>
            <span className="material-symbols-outlined text-outline group-hover:text-black transition-colors">
              arrow_forward
            </span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(property.id)}
      className="group w-full text-left bg-surface-container-lowest rounded-xl overflow-hidden custom-shadow-l1 border border-outline-variant/20 cursor-pointer hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-56 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={property.imageAlt || property.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <Placeholder className="w-full h-56" />
        )}
        <div className="absolute top-2 right-2">
          <span className={`${status.badge} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
            <span className={`w-2 h-2 ${status.dot} rounded-full`} />
            {property.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-xs text-secondary tracking-widest uppercase mb-1">{property.category}</p>
        <h4 className="text-xl font-semibold text-black mb-1">{property.title}</h4>
        <div className="flex items-center gap-1 text-outline mb-4">
          <span className="material-symbols-outlined text-[18px]">location_on</span>
          <span className="text-sm">{property.location}</span>
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
          <p className="text-xl font-semibold text-black">{property.price}</p>
          <span className="material-symbols-outlined text-outline group-hover:text-black transition-colors">
            arrow_forward
          </span>
        </div>
      </div>
    </button>
  );
};

export default PropertyCard;
