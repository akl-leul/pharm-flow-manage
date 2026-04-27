export interface Branch {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  manager_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  role: 'admin' | 'pharmacist' | 'cashier';
  full_name?: string;
  email?: string;
  phone?: string;
  branch_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  payment_terms?: string;
  lead_time_days: number;
  rating: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  allergies: string[];
  preferences: Record<string, unknown>;
  loyalty_points: number;
  credit_balance: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name?: string;
  category: string;
  description?: string;
  manufacturer?: string;
  unit: string;
  batch_number?: string;
  lot_number?: string;
  barcode?: string;
  quantity: number;
  min_stock: number;
  price: number;
  cost_price: number;
  expiry_date: string;
  supplier_id?: string;
  branch_id?: string;
  is_controlled: boolean;
  status: 'active' | 'expired' | 'damaged' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  invoice_number?: string;
  customer_id?: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: 'cash' | 'card' | 'mobile' | 'credit' | 'split';
  payment_details: Record<string, unknown>;
  prescription_id?: string;
  branch_id?: string;
  sold_by?: string;
  notes?: string;
  status: 'completed' | 'returned' | 'refunded' | 'pending';
  created_at: string;
  updated_at: string;
}

export interface SaleItem {
  id: string;
  sale_id: string;
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  discount: number;
  total: number;
  created_at: string;
}

export interface Prescription {
  id: string;
  customer_id?: string;
  doctor_name?: string;
  doctor_phone?: string;
  hospital?: string;
  prescription_date: string;
  notes?: string;
  image_url?: string;
  is_controlled: boolean;
  status: 'active' | 'completed' | 'expired';
  refill_count: number;
  max_refills: number;
  next_refill_date?: string;
  created_at: string;
  updated_at: string;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_id?: string;
  medicine_name: string;
  dosage?: string;
  frequency?: string;
  duration_days?: number;
  quantity: number;
  instructions?: string;
  created_at: string;
}

export interface PurchaseOrder {
  id: string;
  order_number?: string;
  supplier_id: string;
  order_date: string;
  expected_delivery?: string;
  status: 'draft' | 'ordered' | 'received' | 'cancelled';
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  medicine_id?: string;
  medicine_name: string;
  quantity: number;
  unit_price: number;
  received_quantity: number;
  created_at: string;
}

export interface Return {
  id: string;
  sale_id?: string;
  sale_item_id?: string;
  medicine_id?: string;
  customer_id?: string;
  quantity: number;
  reason?: string;
  refund_amount: number;
  status: 'pending' | 'approved' | 'rejected';
  processed_by?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id?: string;
  user_name?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id?: string;
  type: 'expiry' | 'low_stock' | 'order' | 'general' | 'return';
  title: string;
  message?: string;
  is_read: boolean;
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

export interface Setting {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface StockTransfer {
  id: string;
  from_branch_id?: string;
  to_branch_id?: string;
  medicine_id?: string;
  quantity: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  requested_by?: string;
  approved_by?: string;
  notes?: string;
  created_at: string;
}

// Cart item for POS
export interface CartItem {
  medicine: Medicine;
  quantity: number;
  discount: number;
}
