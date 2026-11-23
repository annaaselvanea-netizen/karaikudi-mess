'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  MenuItem,
  Category,
  Order,
  Bill,
  Expense,
  RestaurantSettings,
  CartItem,
  OrderType,
  PaymentMethod,
} from '@/types';
import { dbService } from '@/lib/db-service';
import { generateInvoiceNumber, generateOrderNumber } from '@/lib/utils';
import { syncBillToGoogleSheets } from '@/lib/sheets-service';

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface RestaurantContextType {
  settings: RestaurantSettings;
  updateSettings: (newSettings: RestaurantSettings) => Promise<void>;
  menuItems: MenuItem[];
  categories: Category[];
  refreshMenu: () => Promise<void>;
  addMenuItem: (item: MenuItem) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateQuantity: (menuItemId: string, qty: number) => void;
  updateItemInstruction: (menuItemId: string, instruction: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartDiscount: number;
  setCartDiscount: (discount: number) => void;
  cartTax: number;
  cartTotal: number;
  cartTotalQuantity: number;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  tableNumber: string;
  setTableNumber: (table: string) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  customerPhone: string;
  setCustomerPhone: (phone: string) => void;

  // Orders
  orders: Order[];
  refreshOrders: () => Promise<void>;
  createOrder: (isQuickBill?: boolean) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;

  // Bills
  bills: Bill[];
  refreshBills: () => Promise<void>;
  completePaymentAndBill: (
    paymentMethod: PaymentMethod,
    amountReceived: number,
    splitDetails?: { cashAmount?: number; upiAmount?: number; cardAmount?: number },
    shouldOpenModal?: boolean
  ) => Promise<Bill>;
  activePrintedBill: Bill | null;
  setActivePrintedBill: (bill: Bill | null) => void;

  // Expenses
  expenses: Expense[];
  refreshExpenses: () => Promise<void>;
  addExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Toast
  toasts: ToastMessage[];
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // Reset / Demo
  seedDemoData: () => Promise<void>;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings>(dbService.getSettings as any);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartDiscount, setCartDiscount] = useState<number>(0);
  const [orderType, setOrderType] = useState<OrderType>('dine-in');
  const [tableNumber, setTableNumber] = useState<string>('T1');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Currently viewing/printing bill
  const [activePrintedBill, setActivePrintedBill] = useState<Bill | null>(null);

  // Toast
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial load
  useEffect(() => {
    async function init() {
      const s = await dbService.getSettings();
      setSettings(s);
      const m = await dbService.getMenuItems();
      setMenuItems(m);
      const c = await dbService.getCategories();
      setCategories(c);
      const o = await dbService.getOrders();
      setOrders(o);
      const b = await dbService.getBills();
      setBills(b);
      const e = await dbService.getExpenses();
      setExpenses(e);
    }
    init();
  }, []);

  const refreshMenu = async () => {
    const m = await dbService.getMenuItems();
    setMenuItems(m);
  };

  const refreshOrders = async () => {
    const o = await dbService.getOrders();
    setOrders(o);
  };

  const refreshBills = async () => {
    const b = await dbService.getBills();
    setBills(b);
  };

  const refreshExpenses = async () => {
    const e = await dbService.getExpenses();
    setExpenses(e);
  };

  const updateSettings = async (newSettings: RestaurantSettings) => {
    await dbService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Restaurant settings updated successfully!');
  };

  const addMenuItem = async (item: MenuItem) => {
    await dbService.addMenuItem(item);
    await refreshMenu();
    showToast(`Added ${item.name} to menu`);
  };

  const updateMenuItem = async (item: MenuItem) => {
    await dbService.updateMenuItem(item);
    await refreshMenu();
    showToast(`Updated ${item.name}`);
  };

  const deleteMenuItem = async (id: string) => {
    await dbService.deleteMenuItem(id);
    await refreshMenu();
    showToast('Item deleted from menu', 'info');
  };

  // Cart operations
  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          tamilName: item.tamilName,
          category: item.category,
          price: item.price,
          foodType: item.foodType,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((i) => i.menuItemId !== menuItemId));
  };

  const updateQuantity = (menuItemId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: qty } : i))
    );
  };

  const updateItemInstruction = (menuItemId: string, instruction: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.menuItemId === menuItemId ? { ...i, specialInstructions: instruction } : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setCartDiscount(0);
    setCustomerName('');
    setCustomerPhone('');
  };

  // Cart Totals
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartTotalQuantity = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTax = settings?.taxEnabled ? Math.round((cartSubtotal - cartDiscount) * (settings.taxRate / 100)) : 0;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + cartTax);

  // Create order
  const createOrder = async (isQuickBill = false): Promise<Order> => {
    const tokenNumber = orders.length + 1;
    const newOrder: Order = {
      id: 'ord-' + Date.now(),
      orderNumber: generateOrderNumber(),
      tokenNumber,
      customerName: customerName.trim() || undefined,
      customerPhone: customerPhone.trim() || undefined,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      items: [...cart],
      itemCount: cartTotalQuantity,
      subtotal: cartSubtotal,
      discount: cartDiscount,
      taxAmount: cartTax,
      finalAmount: cartTotal,
      status: isQuickBill ? 'completed' : 'pending',
      paymentStatus: isQuickBill ? 'paid' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.createOrder(newOrder);
    await refreshOrders();
    return newOrder;
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    await dbService.updateOrderStatus(orderId, status);
    await refreshOrders();
    showToast(`Order status updated to ${status}`);
  };

  // Complete Payment & Save Bill
  const completePaymentAndBill = async (
    paymentMethod: PaymentMethod,
    amountReceived: number,
    splitDetails?: { cashAmount?: number; upiAmount?: number; cardAmount?: number },
    shouldOpenModal = true
  ): Promise<Bill> => {
    if (cart.length === 0) {
      throw new Error('Cart is empty');
    }

    // 1. Create order representation
    const order = await createOrder(true);

    // 2. Generate unique Bill
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('en-IN', { hour12: false });
    const billNumber = generateInvoiceNumber(settings.invoicePrefix || 'KM');

    const balanceAmount = Math.max(0, amountReceived - cartTotal);

    const newBill: Bill = {
      id: 'bill-' + Date.now(),
      billNumber,
      orderId: order.id,
      orderNumber: order.orderNumber,
      tokenNumber: order.tokenNumber,
      date: dateStr,
      time: timeStr,
      createdAt: now.toISOString(),
      customerName: customerName.trim() || 'Walk-in Guest',
      customerPhone: customerPhone.trim() || undefined,
      orderType,
      tableNumber: orderType === 'dine-in' ? tableNumber : undefined,
      items: [...cart],
      subtotal: cartSubtotal,
      discount: cartDiscount,
      taxRate: settings.taxEnabled ? settings.taxRate : 0,
      taxAmount: cartTax,
      finalAmount: cartTotal,
      paymentMethod,
      splitDetails,
      amountReceived: amountReceived || cartTotal,
      balanceAmount,
      paymentStatus: 'paid',
      cashierName: 'Murugan (Cashier)',
      syncedToSheets: false,
    };

    // 3. Save Bill in database
    await dbService.saveBill(newBill);
    await refreshBills();

    // 4. Set as active bill for immediate printing if modal requested
    if (shouldOpenModal) {
      setActivePrintedBill(newBill);
    }

    // 5. Automatic Google Sheets Synchronization (if configured & enabled)
    if (settings.sheetsAutoSync) {
      syncBillToGoogleSheets(newBill, settings.sheetsWebhookUrl)
        .then((res) => {
          if (res.success) {
            dbService.updateBillSyncStatus(newBill.id, true);
          }
        })
        .catch((err) => console.warn('Background sheets sync failed:', err));
    }

    // 6. Clear active cart
    clearCart();
    showToast(`Bill #${billNumber} generated successfully!`);
    return newBill;
  };

  // Expenses
  const addExpense = async (expense: Expense) => {
    await dbService.addExpense(expense);
    await refreshExpenses();
    showToast('Expense recorded successfully');
  };

  const deleteExpense = async (id: string) => {
    await dbService.deleteExpense(id);
    await refreshExpenses();
    showToast('Expense removed', 'info');
  };

  const seedDemoData = async () => {
    await dbService.seedDemoData();
    await refreshMenu();
    await refreshExpenses();
    await refreshOrders();
    await refreshBills();
    showToast('Sample Karaikudi Chettinad menu & demo data reloaded!');
  };

  return (
    <RestaurantContext.Provider
      value={{
        settings,
        updateSettings,
        menuItems,
        categories,
        refreshMenu,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemInstruction,
        clearCart,
        cartSubtotal,
        cartDiscount,
        setCartDiscount,
        cartTax,
        cartTotal,
        cartTotalQuantity,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
        customerName,
        setCustomerName,
        customerPhone,
        setCustomerPhone,
        orders,
        refreshOrders,
        createOrder,
        updateOrderStatus,
        bills,
        refreshBills,
        completePaymentAndBill,
        activePrintedBill,
        setActivePrintedBill,
        expenses,
        refreshExpenses,
        addExpense,
        deleteExpense,
        toasts,
        showToast,
        removeToast,
        seedDemoData,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
