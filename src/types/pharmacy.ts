
export interface Medicine {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  expiry_date: string;
  min_stock: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  medicine_id: string;
  medicine_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  sale_date: string;
  sale_time: string;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}
