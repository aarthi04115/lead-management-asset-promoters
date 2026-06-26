import React from "react";
import { Property } from "../types";
import PropertyCard from "./PropertyCard";

interface PropertyGridProps {
  properties: Property[];
  onSelect: (id: string) => void;
  view: "grid" | "list";
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ properties, onSelect, view }) => {
  if (properties.length === 0) {
    return (
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-12 text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">
          search_off
        </span>
        <p className="text-base text-on-surface-variant">
          No properties match your filters.
        </p>
      </div>
    );
  }

  if (view === "list") {
    return (
      <section className="flex flex-col gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onSelect={onSelect}
            view="list"
          />
        ))}
      </section>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => (
        <PropertyCard
          key={property.id}
          property={property}
          onSelect={onSelect}
          view="grid"
        />
      ))}
    </section>
  );
};

export default PropertyGrid;
