// data.ts
// Static lookup data only — no hardcoded properties or stats.
// All properties and stats are fetched live from the backend API.

// Default category options for the Add/Edit Property form
export const propertyCategories = [
  "Residential",
  "Commercial",
  "Resort",
  "Historic",
  "Land",
];

export const propertyStatuses = ["Available", "Negotiation", "Booked"] as const;

// Maps amenity label → Material Symbol icon name
export const amenityIconMap: Record<string, string> = {
  "Infinity Pool": "pool",
  "Rooftop Pool": "pool",
  Pool: "pool",
  "Private Wine Cellar": "local_bar",
  "Wine Cellar": "local_bar",
  "Climate Wine Cellar": "wine_bar",
  "Home Theater": "theater_comedy",
  "Wellness Gym": "fitness_center",
  "Private Gym": "fitness_center",
  Gym: "fitness_center",
  "Fitness Studio": "fitness_center",
  "Private Lounge": "local_bar",
  "Valet Parking": "directions_car",
  "6-Car Garage": "local_parking",
  Parking: "directions_car",
  "Private Beach Access": "beach_access",
  "On-site Restaurant": "restaurant",
  "Spa & Wellness Center": "spa",
  Spa: "spa",
  "Rose Gardens": "park",
  Garden: "park",
  "Private Library": "local_library",
  "Grand Fireplace": "fireplace",
  "Carriage House": "garage",
  Garage: "garage",
  "24/7 Security": "security",
  Security: "security",
};

export const defaultAmenityIcon = "check_circle";

export const adminAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuALdgvjLbcPscLbQkjNsi73nYr0Kd_freptcEdgolMc9GNk6kcXeKnkDAo6uYqSznbLAcqNIG8xBFmt_nttpJ9yHhIuIS96NZSG_ltJPGz5o3C3Hi96OnYmIsKAdTapBkzMT3L9rDlQKjAcOigBupaYyPUC7D8xzXD4QMlDu3Qm22Mon8dmdWJyfKPj2CtIpjQwGcH46VOoi8IkXYMSrGmGv71hiqfFiNa_XjoLQsB18oIantLJqWmlp5ejjHDqapx2aTft6nWwV1jh";
