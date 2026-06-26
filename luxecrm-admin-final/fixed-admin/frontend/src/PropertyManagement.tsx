import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import PageHeader from "./components/PageHeader";
import StatsGrid from "./components/StatsGrid";
import FilterToolbar from "./components/FilterToolbar";
import PropertyGrid from "./components/PropertyGrid";
import PropertyModal from "./components/PropertyModal";
import PropertyFormModal from "./components/PropertyFormModal";
import ConfirmDialog from "./components/ConfirmDialog";
import Toast from "./components/Toast";
import { amenityIconMap, defaultAmenityIcon } from "./data";
import { Property, PropertyFormValues } from "./types";
import { api, ApiProperty } from "./api";

function apiToProperty(p: ApiProperty): Property {
  return {
    id: p._id,
    title: p.title,
    category: p.category,
    location: p.location,
    price: p.price,
    status: p.status,
    images: p.images,
    imageAlt: p.imageAlt,
    description: p.description,
    lotSize: p.lotSize,
    amenities: p.amenities,
    documents: p.documents,
  };
}

function formValuesToBody(values: PropertyFormValues, existing?: Property) {
  // Build documents array
  let documents = existing?.documents ?? [];
  if (values.brochureName) {
    const newDoc = {
      name: values.brochureName,
      size: values.brochureData
        ? `PDF • ${Math.round((values.brochureData.length * 3) / 4 / 1024)} KB`
        : "—",
      meta: "Just uploaded",
      icon: "picture_as_pdf",
      iconColor: "error" as const,
      fileData: values.brochureData ?? undefined,
    };
    // Replace existing brochure or add
    const existing_without = existing?.documents.filter((d) => d.name !== values.brochureName) ?? [];
    documents = [newDoc, ...existing_without];
  }

  return {
    title: values.title,
    category: values.category,
    location: values.location,
    price: values.price,
    status: values.status,
    images: values.images.length > 0 ? values.images : existing?.images ?? [],
    imageAlt: values.title,
    description: values.description,
    lotSize: values.lotSize || "—",
    amenities: values.amenities.map((label) => ({
      label,
      icon: amenityIconMap[label] ?? defaultAmenityIcon,
    })),
    documents,
  };
}

const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Property Management");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [priceFilter, setPriceFilter] = useState("Price Range");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const selectedProperty = properties.find((p) => p.id === selectedId) ?? null;
  const deleteTarget = properties.find((p) => p.id === deleteTargetId) ?? null;

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2500);
  };

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);
      const data = await api.getProperties();
      setProperties(data.map(apiToProperty));
    } catch (err: any) {
      setApiError("Cannot reach the backend. Is the server running on port 5000?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProperties(); }, [loadProperties]);

  const handleAddProperty = () => { setEditingProperty(null); setFormMode("create"); };

  const handleStartEdit = (property: Property) => {
    setEditingProperty(property);
    setFormMode("edit");
    setSelectedId(null);
  };

  const handleFormSubmit = async (values: PropertyFormValues) => {
    try {
      if (formMode === "create") {
        const body = formValuesToBody(values);
        const created = await api.createProperty(body);
        setProperties((prev) => [apiToProperty(created), ...prev]);
        showToast(`✅ ${created.title} created`);
      } else if (formMode === "edit" && editingProperty) {
        const body = formValuesToBody(values, editingProperty);
        const updated = await api.updateProperty(editingProperty.id, body);
        setProperties((prev) =>
          prev.map((p) => (p.id === editingProperty.id ? apiToProperty(updated) : p))
        );
        showToast(`✅ ${updated.title} updated`);
      }
    } catch (err: any) {
      showToast("Error: " + err.message);
    } finally {
      setFormMode(null);
      setEditingProperty(null);
    }
  };

  const handleRequestDelete = (id: string) => setDeleteTargetId(id);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteProperty(deleteTarget.id);
      setProperties((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      showToast(`🗑 ${deleteTarget.title} deleted`);
    } catch (err: any) {
      showToast("Delete failed: " + err.message);
    } finally {
      setDeleteTargetId(null);
      setSelectedId(null);
    }
  };

  // Real download handler — uses stored base64 fileData
  const handleDownload = (docName: string) => {
    const doc = selectedProperty?.documents.find((d) => d.name === docName);
    if (doc?.fileData) {
      const link = document.createElement("a");
      link.href = doc.fileData;
      link.download = doc.name;
      link.click();
    } else {
      showToast(`⚠️ No file data stored for "${docName}". Upload the file again to enable download.`);
    }
  };

  const handleNavClick = (label: string) => {
    setActiveNav(label);
    setSidebarOpen(false);
    if (label !== "Property Management") showToast(`${label} screen would open here`);
  };

  const handleLogout = () => showToast("Logged out (demo)");

  // Build dynamic location list from real properties
  const locationOptions = [
    "All Locations",
    ...Array.from(new Set(properties.map((p) => p.location).filter(Boolean))).sort(),
  ];

  // Parse price string like "₹12Cr", "₹1.5Cr", "$2M" into a number in crores
  const parsePriceCr = (price: string): number => {
    const cleaned = price.replace(/[,\s]/g, "");
    // Handle crore format: ₹12Cr or 12Cr
    const crMatch = cleaned.match(/[\d.]+(?=\s*[Cc]r)/);
    if (crMatch) return parseFloat(crMatch[0]);
    // Handle million format: $2M or 2M → roughly 0.17Cr per $1000
    const mMatch = cleaned.match(/[\d.]+(?=\s*[Mm])/);
    if (mMatch) return parseFloat(mMatch[0]) * 8.3; // approx USD M to Cr
    // Handle lakh: ₹50L
    const lMatch = cleaned.match(/[\d.]+(?=\s*[Ll])/);
    if (lMatch) return parseFloat(lMatch[0]) / 100;
    // Fallback: strip non-numeric and treat as crores
    const num = parseFloat(cleaned.replace(/[^\d.]/g, ""));
    return isNaN(num) ? 0 : num;
  };

  const filteredProperties = properties.filter((p) => {
    const matchesLocation =
      locationFilter === "All Locations" || p.location.includes(locationFilter);

    const matchesSearch =
      searchQuery.trim() === "" ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesPrice = true;
    if (priceFilter !== "Price Range") {
      const priceCr = parsePriceCr(p.price);
      if (priceFilter === "₹1Cr - ₹5Cr") matchesPrice = priceCr >= 1 && priceCr < 5;
      else if (priceFilter === "₹5Cr - ₹20Cr") matchesPrice = priceCr >= 5 && priceCr < 20;
      else if (priceFilter === "₹20Cr+") matchesPrice = priceCr >= 20;
    }

    return matchesLocation && matchesSearch && matchesPrice;
  });

  return (
    <div className="bg-background text-on-background min-h-screen">
      <Sidebar
        activeNav={activeNav}
        onNavClick={handleNavClick}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
      />
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <TopNav
        onMenuClick={() => setSidebarOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onBellClick={() => showToast("No new notifications")}
        onAlertClick={() => showToast("1 important notification")}
      />

      <main className="lg:ml-[260px] min-h-screen pt-16 px-4 sm:px-6 lg:px-8 pb-8">
        <PageHeader onAddProperty={handleAddProperty} />
        <StatsGrid />

        {apiError && (
          <div className="mb-4 rounded-lg border border-red-400 bg-red-50 px-4 py-3 text-red-700 text-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            {apiError}
            <button onClick={loadProperties} className="ml-auto underline text-xs font-medium">Retry</button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Loading properties from database…
          </div>
        ) : (
          <>
            <FilterToolbar
              totalCount={filteredProperties.length}
              showingLabel={`Showing ${filteredProperties.length} of ${properties.length}`}
              view={view}
              onViewChange={setView}
              locationFilter={locationFilter}
              onLocationChange={setLocationFilter}
              priceFilter={priceFilter}
              onPriceChange={setPriceFilter}
              locations={locationOptions}
            />
            <PropertyGrid properties={filteredProperties} onSelect={setSelectedId} view={view} />
          </>
        )}
      </main>

      <PropertyModal
        property={selectedProperty}
        onClose={() => setSelectedId(null)}
        onEdit={() => selectedProperty && handleStartEdit(selectedProperty)}
        onDelete={() => selectedProperty && handleRequestDelete(selectedProperty.id)}
        onUpload={() => showToast("File picker would open here")}
        onDownload={handleDownload}
      />

      {formMode && (
        <PropertyFormModal
          mode={formMode}
          initialProperty={editingProperty}
          onClose={() => { setFormMode(null); setEditingProperty(null); }}
          onSubmit={handleFormSubmit}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete property?"
          message={`This will permanently remove "${deleteTarget.title}" from your listings. This action cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteTargetId(null)}
        />
      )}

      <Toast message={toast} />
    </div>
  );
};

export default PropertyManagement;
