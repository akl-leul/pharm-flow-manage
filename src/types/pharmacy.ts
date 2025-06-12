
export interface Medicine {
  id: string;
  name: string;
  stock: number;
  price: number;
  category: string;
  expiryDate: string;
  minStock: number;
}

export interface Sale {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  price: number;
  totalAmount: number;
  date: string;
  time: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
}
