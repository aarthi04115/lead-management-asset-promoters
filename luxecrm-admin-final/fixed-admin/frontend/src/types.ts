export type PropertyStatus = "Available" | "Negotiation" | "Booked";

export interface Property {
  id: string;
  title: string;
  category: string;
  location: string;
  price: string;
  status: PropertyStatus;
  images: string[];
  imageAlt: string;
  description: string;
  lotSize: string;
  amenities: Amenity[];
  documents: PropertyDocument[];
}

export interface Amenity {
  icon: string;
  label: string;
}

export interface PropertyDocument {
  name: string;
  size: string;
  meta: string;
  iconColor: "error" | "primary";
  icon: string;
  fileData?: string; // base64 data URL for real download
}

export interface StatCard {
  label: string;
  value: string;
  suffix?: string;
  icon: string;
  accentColor: "primary" | "secondary" | "error" | "surface-tint";
}

export interface PropertyFormValues {
  id?: string;
  title: string;
  description: string;
  price: string;
  location: string;
  category: string;
  status: PropertyStatus;
  lotSize: string;
  images: string[];
  brochureName: string | null;
  brochureData: string | null; // base64 data URL
  amenities: string[];
}
