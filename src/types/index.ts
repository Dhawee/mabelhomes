export interface Property {
  id: string;
  slug: string;
  title: string;
  location: string;
  city: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: "For Sale" | "For Rent" | "Sold" | "Under Offer";
  type: "Duplex" | "Apartment" | "Mansion" | "Land" | "Commercial" | "Terrace";
  featured: boolean;
  luxury: boolean;
  images: string[];
  description: string;
  features: string[];
  amenities: string[];
  yearBuilt?: number;
  parking?: number;
  videoTour?: string;
  coordinates: { lat: number; lng: number };
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  image: string;
  service: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  readTime: string;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  longDescription?: string;
  process?: { title: string; description: string }[];
  benefits?: string[];
}
