const BASE_URL = "http://localhost:5000/api";

export interface ApiProperty {
  _id: string;
  title: string;
  category: string;
  location: string;
  price: string;
  status: "Available" | "Negotiation" | "Booked";
  images: string[];
  imageAlt: string;
  description: string;
  lotSize: string;
  amenities: { icon: string; label: string }[];
  documents: {
    name: string;
    size: string;
    meta: string;
    iconColor: "error" | "primary";
    icon: string;
    fileData?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface StatsData {
  total: number;
  available: number;
  booked: number;
  negotiation: number;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data.data as T;
}

export const api = {
  getProperties: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<ApiProperty[]>(`/properties${qs}`);
  },
  getStats: () => request<StatsData>("/properties/stats"),
  getProperty: (id: string) => request<ApiProperty>(`/properties/${id}`),
  createProperty: (body: object) =>
    request<ApiProperty>("/properties", { method: "POST", body: JSON.stringify(body) }),
  updateProperty: (id: string, body: object) =>
    request<ApiProperty>(`/properties/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProperty: (id: string) =>
    request<{ message: string }>(`/properties/${id}`, { method: "DELETE" }),
};
