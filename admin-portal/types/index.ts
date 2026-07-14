// Admin Portal Types — mirrors the Django REST API response shapes.
// Business logic stays in Django. This file is for TypeScript type safety only.

export interface PropertyVideo {
  id: number;
  title: string;
  video_url: string;
  video_src: string | null;
  video_type: "upload" | "youtube" | "vimeo" | "external";
  order: number;
}

export interface Property {
  id: number;
  slug: string;
  title: string;
  location: string;
  city: string;
  state?: string;
  country?: string;
  price: number;
  previous_price?: number;
  current_price?: number;
  status: "For Sale" | "For Rent" | "Sold" | "Under Offer" | "Shortlet" | "Archived";
  type: string;
  type_slug: string;
  featured: boolean;
  luxury: boolean;
  is_visible: boolean;
  is_deleted?: boolean;
  primary_image: string | null;
  images: string[];
  images_details?: any[];
  videos: PropertyVideo[];
  description: string;
  features: string[];
  amenities: string[];
  property_type: number;
  latitude: number;
  longitude: number;
  year_built: number;
  parking: number;
  likes_count: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
}

export interface PropertyEnquiry {
  id: number;
  property: number;
  property_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "Pending" | "Responded" | "Closed";
  replied: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceEnquiry {
  id: number;
  service_type: number;
  service_title: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: "Pending" | "Responded" | "Closed";
  replied: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: "Pending" | "Responded" | "Closed";
  replied: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  notification_type: "property_enquiry" | "service_enquiry" | "contact" | "like" | "system";
  read: boolean;
  created_at: string;
}

export interface DashboardStats {
  total_properties: number;
  visible_properties: number;
  featured_properties: number;
  luxury_properties: number;
  hidden_properties: number;
  sold_properties: number;
  total_likes: number;
  property_enquiries: number;
  service_enquiries: number;
  contact_messages: number;
  unread_notifications: number;
  total_media_assets: number;
}

export interface MediaAsset {
  id: number;
  file_url: string;
  file_name: string;
  media_type: "image" | "video" | "document";
  mime_type: string;
  file_size: number;
  alt_text: string;
  folder: string;
  uploaded_by_name: string;
  created_at: string;
}

export interface AuditLog {
  id: number;
  username: string;
  action: string;
  model_name: string;
  object_id: string;
  description: string;
  ip_address: string | null;
  timestamp: string;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  full_name: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
  avatar?: string | null;
  groups?: number[];
  groups_names?: string[];
  user_permissions?: number[];
}

export interface SiteSettings {
  company_name: string;
  tagline: string;
  phone_primary: string;
  phone_secondary: string;
  whatsapp: string;
  email: string;
  address: string;
  website: string;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  youtube_url: string;
  meta_title: string;
  meta_description: string;
  footer_text: string;
  copyright_text: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
