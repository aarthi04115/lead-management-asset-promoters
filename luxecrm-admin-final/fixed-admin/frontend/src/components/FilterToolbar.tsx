import React from "react";

interface FilterToolbarProps {
  totalCount: number;
  showingLabel: string;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  locationFilter: string;
  onLocationChange: (value: string) => void;
  priceFilter: string;
  onPriceChange: (value: string) => void;
  locations: string[];
}

const priceRanges = [
  "Price Range",
  "₹1Cr - ₹5Cr",
  "₹5Cr - ₹20Cr",
  "₹20Cr+",
];

const FilterToolbar: React.FC<FilterToolbarProps> = ({
  showingLabel,
  view,
  onViewChange,
  locationFilter,
  onLocationChange,
  priceFilter,
  onPriceChange,
  locations,
}) => {
  return (
    <section className="bg-surface-container-lowest p-4 rounded-xl custom-shadow-l1 mb-6 flex flex-wrap items-center justify-between gap-4 border border-outline-variant/30">
      <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant w-full sm:w-auto">
          <span className="material-symbols-outlined text-outline text-base">
            location_on
          </span>
          <select
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface-variant min-w-[140px] w-full"
          >
            {locations.map((loc) => (
              <option key={loc}>{loc}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant w-full sm:w-auto">
          <span className="material-symbols-outlined text-outline text-base">
            payments
          </span>
          <select
            value={priceFilter}
            onChange={(e) => onPriceChange(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface-variant min-w-[140px] w-full"
          >
            {priceRanges.map((range) => (
              <option key={range}>{range}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
        <p className="text-xs text-outline mr-2">{showingLabel}</p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
            aria-pressed={view === "grid"}
            className={
              view === "grid"
                ? "p-2 bg-surface-variant/20 rounded-lg text-black hover:bg-surface-variant/40 transition-colors"
                : "p-2 rounded-lg text-outline hover:bg-surface-variant/20 transition-colors"
            }
          >
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-label="List view"
            aria-pressed={view === "list"}
            className={
              view === "list"
                ? "p-2 bg-surface-variant/20 rounded-lg text-black hover:bg-surface-variant/40 transition-colors"
                : "p-2 rounded-lg text-outline hover:bg-surface-variant/20 transition-colors"
            }
          >
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default FilterToolbar;
