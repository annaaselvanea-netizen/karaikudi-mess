import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  MenuItem,
  Category,
  Order,
  Bill,
  Expense,
  RestaurantSettings,
  AppUser,
  GoogleSheetsSyncLog,
} from '@/types';
import {
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_EXPENSES,
  INITIAL_USERS,
  DEFAULT_SETTINGS,
} from './sample-data';

const STORAGE_KEYS = {
  MENU: 'km_menu_items',
  CATEGORIES: 'km_categories',
  ORDERS: 'km_orders',
  BILLS: 'km_bills',
  EXPENSES: 'km_expenses',
  SETTINGS: 'km_settings',
  USERS: 'km_users',
  SYNC_LOGS: 'km_sync_logs',
};

// Check if localStorage is available
const isClient = typeof window !== 'undefined';

function getLocal<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setLocal<T>(key: string, val: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error('Local storage write error:', e);
  }
}

export const dbService = {
  // SETTINGS
  async getSettings(): Promise<RestaurantSettings> {
    try {
      const local = getLocal<RestaurantSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      // Try firestore if available
      try {
        const snap = await getDocs(collection(db, 'settings'));
        if (!snap.empty) {
          const remoteSettings = snap.docs[0].data() as RestaurantSettings;
          setLocal(STORAGE_KEYS.SETTINGS, remoteSettings);
          return remoteSettings;
        }
      } catch (err) {
        // Fallback to local
      }
      return local;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  },

  async saveSettings(settings: RestaurantSettings): Promise<void> {
    setLocal(STORAGE_KEYS.SETTINGS, settings);
    try {
      await setDoc(doc(db, 'settings', 'main'), settings, { merge: true });
    } catch (e) {
      console.warn('Firestore settings update skipped, saved locally');
    }
  },

  // CATEGORIES
  async getCategories(): Promise<Category[]> {
    const local = getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as Category);
        setLocal(STORAGE_KEYS.CATEGORIES, list);
        return list;
      }
    } catch (e) {
      // Local fallback
    }
    return local;
  },

  // MENU ITEMS
  async getMenuItems(): Promise<MenuItem[]> {
    const local = getLocal<MenuItem[]>(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
    try {
      const snap = await getDocs(collection(db, 'menuItems'));
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as MenuItem);
        setLocal(STORAGE_KEYS.MENU, list);
        return list;
      }
    } catch (e) {
      // Local fallback
    }
    return local;
  },

  async addMenuItem(item: MenuItem): Promise<void> {
    const current = await this.getMenuItems();
    const updated = [item, ...current];
    setLocal(STORAGE_KEYS.MENU, updated);
    try {
      await setDoc(doc(db, 'menuItems', item.id), item);
    } catch (e) {
      console.warn('Firestore add menu skipped, saved locally');
    }
  },

  async updateMenuItem(item: MenuItem): Promise<void> {
    const current = await this.getMenuItems();
    const updated = current.map((i) => (i.id === item.id ? item : i));
    setLocal(STORAGE_KEYS.MENU, updated);
    try {
      await updateDoc(doc(db, 'menuItems', item.id), { ...item });
    } catch (e) {
      console.warn('Firestore update menu skipped, saved locally');
    }
  },

  async deleteMenuItem(id: string): Promise<void> {
    const current = await this.getMenuItems();
    const updated = current.filter((i) => i.id !== id);
    setLocal(STORAGE_KEYS.MENU, updated);
    try {
      await deleteDoc(doc(db, 'menuItems', id));
    } catch (e) {
      console.warn('Firestore delete menu skipped, saved locally');
    }
  },

  // ORDERS
  async getOrders(): Promise<Order[]> {
    const local = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as Order);
        setLocal(STORAGE_KEYS.ORDERS, list);
        return list;
      }
    } catch (e) {
      // Local fallback
    }
    return local;
  },

  async createOrder(order: Order): Promise<void> {
    const current = await this.getOrders();
    const updated = [order, ...current];
    setLocal(STORAGE_KEYS.ORDERS, updated);
    try {
      await setDoc(doc(db, 'orders', order.id), order);
    } catch (e) {
      console.warn('Firestore order create skipped, saved locally');
    }
  },

  async updateOrderStatus(orderId: string, status: Order['status']): Promise<void> {
    const current = await this.getOrders();
    const updated = current.map((o) => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o));
    setLocal(STORAGE_KEYS.ORDERS, updated);
    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
    } catch (e) {
      console.warn('Firestore order status update skipped');
    }
  },

  // BILLS
  async getBills(): Promise<Bill[]> {
    const local = getLocal<Bill[]>(STORAGE_KEYS.BILLS, []);
    try {
      const snap = await getDocs(collection(db, 'bills'));
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as Bill);
        setLocal(STORAGE_KEYS.BILLS, list);
        return list;
      }
    } catch (e) {
      // Local fallback
    }
    return local;
  },

  async saveBill(bill: Bill): Promise<void> {
    const current = await this.getBills();
    const updated = [bill, ...current];
    setLocal(STORAGE_KEYS.BILLS, updated);
    try {
      await setDoc(doc(db, 'bills', bill.id), bill);
    } catch (e) {
      console.warn('Firestore bill save skipped, saved locally');
    }
  },

  async updateBillSyncStatus(billId: string, synced: boolean): Promise<void> {
    const current = await this.getBills();
    const updated = current.map((b) =>
      b.id === billId ? { ...b, syncedToSheets: synced, sheetsSyncDate: new Date().toISOString() } : b
    );
    setLocal(STORAGE_KEYS.BILLS, updated);
    try {
      await updateDoc(doc(db, 'bills', billId), {
        syncedToSheets: synced,
        sheetsSyncDate: new Date().toISOString(),
      });
    } catch (e) {
      console.warn('Firestore bill sync update skipped');
    }
  },

  // EXPENSES
  async getExpenses(): Promise<Expense[]> {
    const local = getLocal<Expense[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    try {
      const snap = await getDocs(collection(db, 'expenses'));
      if (!snap.empty) {
        const list = snap.docs.map((d) => d.data() as Expense);
        setLocal(STORAGE_KEYS.EXPENSES, list);
        return list;
      }
    } catch (e) {
      // Local fallback
    }
    return local;
  },

  async addExpense(expense: Expense): Promise<void> {
    const current = await this.getExpenses();
    const updated = [expense, ...current];
    setLocal(STORAGE_KEYS.EXPENSES, updated);
    try {
      await setDoc(doc(db, 'expenses', expense.id), expense);
    } catch (e) {
      console.warn('Firestore expense add skipped, saved locally');
    }
  },

  async deleteExpense(id: string): Promise<void> {
    const current = await this.getExpenses();
    const updated = current.filter((e) => e.id !== id);
    setLocal(STORAGE_KEYS.EXPENSES, updated);
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (e) {
      console.warn('Firestore expense delete skipped');
    }
  },

  // USERS
  async getUsers(): Promise<AppUser[]> {
    return getLocal<AppUser[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },

  // SYNC LOGS
  async getSyncLogs(): Promise<GoogleSheetsSyncLog[]> {
    return getLocal<GoogleSheetsSyncLog[]>(STORAGE_KEYS.SYNC_LOGS, []);
  },

  async addSyncLog(log: GoogleSheetsSyncLog): Promise<void> {
    const current = await this.getSyncLogs();
    setLocal(STORAGE_KEYS.SYNC_LOGS, [log, ...current.slice(0, 49)]);
  },

  // SEED INITIAL DEMO DATA
  async seedDemoData(): Promise<void> {
    setLocal(STORAGE_KEYS.MENU, INITIAL_MENU_ITEMS);
    setLocal(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    setLocal(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    setLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    setLocal(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
};
