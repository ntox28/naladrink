export enum ProductSize {
  REGULER = 'Reguler',
  JUMBO = 'Jumbo',
  LITERAN = 'Literan',
}

export enum PaymentMethod {
  TUNAI = 'Tunai',
  QRIS = 'QRIS',
  EWALLET = 'E-Wallet',
}

export enum View {
  POS = 'POS',
  EXPENSES = 'Expenses',
  PRODUCTS = 'Products',
  REPORTS = 'Reports',
  SETTINGS = 'Settings',
  DATA_MANAGEMENT = 'Data Management',
}

export enum ExpenseCategory {
    OPERASIONAL = 'Operasional',
    BAHAN_BAKU = 'Bahan Baku',
    LAINNYA = 'Lainnya'
}

export enum UserRole {
    ADMIN = 'Admin',
    KASIR = 'Kasir'
}

// Corresponds to the 'users' table in Supabase
export interface User {
    id: string; // UUID from Supabase Auth
    name: string;
    pin?: string; // Kept for type compatibility, but auth is handled by Supabase Auth
    role: UserRole;
    created_at?: string;
}

// Corresponds to the 'expenses' table
export interface Expense {
    id: string;
    date: string; // ISO string
    description: string;
    amount: number;
    category: ExpenseCategory;
    created_at?: string;
}

// Corresponds to the 'products' table
export interface Product {
  id: string;
  name: string;
  size: ProductSize;
  price: number;
  is_active: boolean;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  size: ProductSize;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Corresponds to the 'transaction_details' table
export interface TransactionDetail {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

// Corresponds to the 'transactions' table
export interface Transaction {
  id: string;
  transaction_code: string;
  date: string; // ISO string
  cashier_id: string; // UUID of the user
  cashier_name?: string; // Fetched for display
  total: number;
  payment_method: PaymentMethod;
  amount_received?: number;
  change?: number;
  notes?: string;
  details: TransactionDetail[]; // For frontend use, populated from transaction_details table
}