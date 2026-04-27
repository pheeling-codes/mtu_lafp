export interface Profile {
  id: string;
  full_name: string;
  email: string;
  matric_number: string | null;
  avatar_url: string | null;
  role: 'STUDENT' | 'STAFF' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

// Keep User alias for backward compatibility
export type User = Profile;

export interface Category {
  id: string;
  name: string;
  description: string | null;
}

export interface Location {
  id: string;
  name: string;
  landmark: string | null;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  type: 'LOST' | 'FOUND';
  title: string;
  description_public: string;
  description_private: string | null;
  status: 'OPEN' | 'MATCHED' | 'CLOSED' | 'EXPIRED';
  image_url: string | null;
  dateLostOrFound: Date | null;
  createdAt: Date;
  updatedAt: Date;
  categoryId: string;
  locationId: string;
  reporterId: string;
}

export interface Claim {
  id: string;
  itemId: string;
  seekerId: string;
  verificationText: string;
  proofUrl: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: Date;
  updatedAt: Date;
}

export interface Match {
  id: string;
  lostItemId: string;
  foundItemId: string;
  score: number;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  createdAt: Date;
}

// API Response Types
export interface HealthCheckResponse {
  status: string;
  service: string;
}
