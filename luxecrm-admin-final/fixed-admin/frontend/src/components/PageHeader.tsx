import React from "react";

interface PageHeaderProps {
  onAddProperty: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ onAddProperty }) => {
  return (
    <section className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 sm:mt-6 mb-8 gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-black">
          Property Management
        </h2>
        <p className="text-sm sm:text-base text-on-surface-variant mt-1">
          Oversee your global inventory and high-end listings.
        </p>
      </div>
      <button
        type="button"
        onClick={onAddProperty}
        className="flex items-center justify-center gap-2 bg-secondary-container text-[#241a00] px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-sm font-semibold shadow-md hover:shadow-lg transition-all active:scale-95 w-full sm:w-auto"
      >
        <span className="material-symbols-outlined">add_circle</span>
        Add Property
      </button>
    </section>
  );
};

export default PageHeader;
