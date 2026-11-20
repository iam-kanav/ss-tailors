export type UserRole = "customer" | "admin";

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  tibetan_name: string;
  description: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  slug: string;
  sku: string;
  name: string;
  tibetan_name: string;
  description: string;
  fabric: string;
  care_instructions: string;
  price_paise: number;
  compare_at_paise: number | null;
  stock_quantity: number;
  sizes: string[];
  allow_custom_tailoring: boolean;
  lead_time_days: number;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithCategory extends Product {
  categories: Pick<Category, "id" | "slug" | "name" | "tibetan_name"> | null;
}

export interface CartItem {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  imageUrl: string;
  pricePaise: number;
  size: string;
  quantity: number;
  isCustomTailored: boolean;
  maxStock: number;
}

export interface CustomMeasurements {
  chestInches?: string;
  waistInches?: string;
  hipInches?: string;
  shoulderInches?: string;
  sleeveInches?: string;
  lengthInches?: string;
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "tailoring"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_sku: string;
  size: string;
  quantity: number;
  unit_price_paise: number;
  line_total_paise: number;
  is_custom_tailored: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  fulfillment_method: "delivery" | "studio_pickup";
  shipping_address: Record<string, string>;
  custom_measurements: CustomMeasurements;
  subtotal_paise: number;
  shipping_paise: number;
  total_paise: number;
  status: OrderStatus;
  notes: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface TailoringInquiry {
  id: string;
  customer_id: string | null;
  name: string;
  email: string;
  phone: string;
  garment_type: string;
  preferred_date: string | null;
  notes: string;
  status: "new" | "contacted" | "scheduled" | "completed" | "archived";
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, unknown>;
  created_at: string;
}
