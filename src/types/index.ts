export type FoodType = 'veg' | 'non-veg';

export interface Category {
  id: string;
  name: string;
  tamilName?: string;
  icon?: string;
  sortOrder: number;
}

export interface MenuItem {
  id: string;
  name: string;
  tamilName?: string;
  category: string;
  price: number;
  foodType: FoodType;
  image: string;
  isAvailable: boolean;
  description?: string;
  isPopular?: boolean;
}

export type OrderType = 'dine-in' | 'takeaway' | 'parcel';
export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'split';
export type PaymentStatus = 'paid' | 'pending';

export interface CartItem {
  menuItemId: string;
  name: string;
  tamilName?: string;
  category: string;
  price: number;
  foodType: FoodType;
  quantity: number;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  billNumber?: string;
  tokenNumber: number;
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  tableNumber?: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  taxAmount: number;
  finalAmount: number;
  status: OrderStatus;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string; // ISO String
  updatedAt: string;
  notes?: string;
  syncedToSheets?: boolean;
}

export interface Bill {
  id: string;
  billNumber: string;
  orderId: string;
  orderNumber: string;
  tokenNumber: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm:ss
  createdAt: string; // ISO
  customerName?: string;
  customerPhone?: string;
  orderType: OrderType;
  tableNumber?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  taxRate: number; // e.g. 5%
  taxAmount: number;
  finalAmount: number;
  paymentMethod: PaymentMethod;
  splitDetails?: {
    cashAmount?: number;
    upiAmount?: number;
    cardAmount?: number;
  };
  amountReceived: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  cashierName: string;
  syncedToSheets?: boolean;
  sheetsSyncDate?: string;
}

export type ExpenseCategory =
  | 'Vegetables'
  | 'Meat & Poultry'
  | 'Groceries'
  | 'Dairy'
  | 'Staff Salary'
  | 'LPG & Fuel'
  | 'Maintenance'
  | 'Rent'
  | 'Electricity'
  | 'Miscellaneous';

export interface Expense {
  id: string;
  expenseNumber: string;
  date: string; // YYYY-MM-DD
  time: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paymentMethod: 'cash' | 'upi' | 'card' | 'bank_transfer';
  vendorName?: string;
  paidBy?: string;
  receiptNumber?: string;
  createdAt: string;
  syncedToSheets?: boolean;
}

export type UserRole = 'admin' | 'cashier' | 'staff';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export interface RestaurantSettings {
  name: string;
  tamilName?: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  gstin?: string;
  fssaiNumber?: string;
  currencySymbol: string;
  taxRate: number; // percentage, e.g. 5
  taxEnabled: boolean;
  invoicePrefix: string;
  thermalPaperSize: '58mm' | '80mm';
  receiptFooterMessage: string;
  thermalCutPaper: boolean;
  sheetsWebhookUrl?: string;
  sheetsAutoSync: boolean;
  firebaseProjectId?: string;
}

export interface GoogleSheetsSyncLog {
  id: string;
  timestamp: string;
  billId: string;
  billNumber: string;
  status: 'success' | 'failed' | 'pending';
  message: string;
  recordsSynced: number;
}
