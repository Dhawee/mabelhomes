// ---------------------------------------------------------------------------
// Property Video
// ---------------------------------------------------------------------------

export interface PropertyVideo {
  id: number;
  video_type: "upload" | "youtube" | "vimeo" | "external";
  video_src: string | null;    // Absolute URL for uploaded files
  video_url: string | null;    // Original URL for external videos
  embed_url: string | null;    // Embed-ready URL (YouTube/Vimeo converted)
  title: string;
  order: number;
  is_primary: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------

export interface Property {
  id: string | number;
  slug: string;
  title: string;
  location: string;
  city: string;
  price: number;
  max_price?: number | null;
  currency?: "NGN" | "USD" | null;
  previous_price?: number;
  current_price?: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: "For Sale" | "For Rent" | "Sold" | "Under Offer" | "Shortlet";
  type: string;
  type_slug?: string;
  featured: boolean;
  luxury: boolean;
  primary_image?: string | null;
  images: string[];
  images_details?: {
    id: number;
    image: string;
    thumbnail: string;
    original: string;
    order: number;
    is_primary: boolean;
  }[];
  videos?: PropertyVideo[];
  description: string;
  features: string[];
  amenities: string[];
  year_built?: number;
  yearBuilt?: number;
  parking?: number;
  video_tour?: string;
  coordinates: { lat: number; lng: number };
  building_approval?: string;
  buildingApproval?: string;
  survey?: string;
  document_title?: string;
  documentTitle?: string;
  likes_count?: number;
  created_at?: string;
  updated_at?: string;
}

// ---------------------------------------------------------------------------
// Enquiry types
// ---------------------------------------------------------------------------

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
}

export interface EnquiryReply {
  id: number;
  content_type: number;
  object_id: number;
  content_type_name: string;
  sender: number | null;
  sender_name: string;
  recipient_email: string;
  subject: string;
  message: string;
  email_delivered: boolean;
  sent_at: string;
}

// ---------------------------------------------------------------------------
// Like Status
// ---------------------------------------------------------------------------

export interface LikeStatus {
  liked: boolean;
  likes_count: number;
  message?: string;
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Admin Notification
// ---------------------------------------------------------------------------

export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  notification_type: "property_enquiry" | "service_enquiry" | "contact" | "like" | "system";
  read: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Media Asset
// ---------------------------------------------------------------------------

export interface MediaAsset {
  id: number;
  file_url: string;
  file_name: string;
  media_type: "image" | "video" | "document";
  mime_type: string;
  file_size: number;
  alt_text: string;
  folder: string;
  uploaded_by: number | null;
  uploaded_by_name: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Site Settings (public)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Audit Log
// ---------------------------------------------------------------------------

export interface AuditLog {
  id: number;
  user: number | null;
  username: string;
  action: "login" | "logout" | "create" | "update" | "delete" | "reply" | "upload" | "settings" | "other";
  model_name: string;
  object_id: string;
  description: string;
  ip_address: string | null;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  last_login: string | null;
  date_joined: string;
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ---------------------------------------------------------------------------
// Existing types (unchanged)
// ---------------------------------------------------------------------------

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  review: string;
  image: string;
  service: string;
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
