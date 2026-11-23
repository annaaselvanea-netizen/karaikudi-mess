'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.dashboard': 'Main Dashboard',
    'nav.dashboard.sub': 'Overview & Stats',
    'nav.pos': 'POS Billing',
    'nav.pos.sub': 'Billing Counter',
    'nav.orders': 'Order Management',
    'nav.orders.sub': 'Status & KDS',
    'nav.menu': 'Food Menu',
    'nav.menu.sub': 'Dishes & Prices',
    'nav.expenses': 'Expense Management',
    'nav.expenses.sub': 'Daily Costs',
    'nav.reports': 'Reports & Analytics',
    'nav.reports.sub': 'Sales & P&L',
    'nav.sheets': 'Google Sheets Sync',
    'nav.sheets.sub': 'Cloud Sync',
    'nav.settings': 'Restaurant Settings',
    'nav.settings.sub': 'Printer & Store',

    // Header
    'header.newBill': 'New Bill',
    'header.activeOrders': 'Active Orders',
    'header.pos': 'POS',

    // POS
    'pos.searchPlaceholder': 'Search Chettinad dishes (English / தமிழ்)...',
    'pos.all': 'All Items',
    'pos.veg': 'Pure Veg',
    'pos.nonVeg': 'Non-Veg',
    'pos.add': 'Add',
    'pos.outOfStock': 'Out of Stock',
    'pos.popular': 'Popular',
    'pos.dineIn': 'Dine-In',
    'pos.takeaway': 'Takeaway',
    'pos.parcel': 'Parcel',
    'pos.tableNo': 'Table No.',
    'pos.customerPhone': 'Customer Mobile (Opt)',
    'pos.customerName': 'Customer Name (Optional)',
    'pos.cartEmpty': 'Cart is empty',
    'pos.cartEmptySub': 'Tap dishes on the menu grid to add them to this bill.',
    'pos.subtotal': 'Subtotal',
    'pos.discount': 'Discount',
    'pos.discountPlaceholder': 'Discount (₹)',
    'pos.apply': 'Apply',
    'pos.tax': 'GST',
    'pos.totalAmount': 'Total Amount',
    'pos.clearCart': 'Clear Cart',
    'pos.paymentMethod': 'Payment Mode',
    'pos.cash': 'Cash',
    'pos.upi': 'UPI / QR',
    'pos.card': 'Card',
    'pos.split': 'Split',
    'pos.amountReceived': 'Amount Received (₹)',
    'pos.balanceDue': 'Balance / Change Due',
    'pos.printAndSettle': 'Print Receipt & Settle Bill',
    'pos.quickNotes': 'Quick Notes',
    'pos.exact': 'Exact',
    'pos.billSettled': 'Bill Settled Successfully!',
    'pos.changeToReturn': 'Change to return to guest',
    'pos.nextOrder': 'Next Customer / New Order',
    'pos.reprint': 'Reprint',

    // Dashboard
    'dash.welcome': 'Karaikudi Mess Dashboard',
    'dash.welcomeSub': 'Welcome! Monitor real-time sales, orders, and restaurant expenses.',
    'dash.launchPos': 'Launch POS Billing',
    'dash.todaySales': "Today's Total Sales",
    'dash.todayOrders': "Today's Total Orders",
    'dash.cashPayments': 'Cash Payments',
    'dash.upiPayments': 'UPI Payments',
    'dash.totalRevenue': 'Total Revenue',
    'dash.pendingPayments': 'Pending Payments',
    'dash.totalExpenses': 'Total Expenses',
    'dash.netProfit': 'Net Profit',
  },
  ta: {
    // Nav
    'nav.dashboard': 'முகப்பு பலகை',
    'nav.dashboard.sub': 'கண்ணோட்டம் & புள்ளிவிவரங்கள்',
    'nav.pos': 'பில்லிங் கவுண்டர்',
    'nav.pos.sub': 'விரைவு பில்லிங்',
    'nav.orders': 'ஆர்டர் மேலாண்மை',
    'nav.orders.sub': 'தயாரிப்பு & நிலை',
    'nav.menu': 'உணவுப் பட்டியல்',
    'nav.menu.sub': 'உணவுகள் & விலைகள்',
    'nav.expenses': 'செலவு கணக்கு',
    'nav.expenses.sub': 'தினசரி செலவுகள்',
    'nav.reports': 'விற்பனை அறிக்கைகள்',
    'nav.reports.sub': 'லாப நட்டக் கணக்கு',
    'nav.sheets': 'கூகுள் தாள்கள் இணைப்பு',
    'nav.sheets.sub': 'தானியங்கி ஒத்திசைவு',
    'nav.settings': 'அமைப்புகள்',
    'nav.settings.sub': 'பிரிண்டர் & விபரங்கள்',

    // Header
    'header.newBill': 'புதிய பில்',
    'header.activeOrders': 'நடப்பு ஆர்டர்கள்',
    'header.pos': 'பில்',

    // POS
    'pos.searchPlaceholder': 'செட்டிநாடு உணவுகளைத் தேடுங்கள்...',
    'pos.all': 'அனைத்தும்',
    'pos.veg': 'சைவம்',
    'pos.nonVeg': 'அசைவம்',
    'pos.add': 'சேர்',
    'pos.outOfStock': 'முடிந்துவிட்டது',
    'pos.popular': 'ஸ்பெஷல்',
    'pos.dineIn': 'உள்ளே அமர்ந்து',
    'pos.takeaway': 'பார்சல்',
    'pos.parcel': 'பார்சல்',
    'pos.tableNo': 'மேஜை எண்',
    'pos.customerPhone': 'வாடிக்கையாளர் அலைபேசி',
    'pos.customerName': 'வாடிக்கையாளர் பெயர்',
    'pos.cartEmpty': 'கூடை காலியாக உள்ளது',
    'pos.cartEmptySub': 'உணவைச் சேர்க்க இடதுபுறம் உள்ள உணவு அட்டையைத் தொடவும்.',
    'pos.subtotal': 'கூட்டுத்தொகை',
    'pos.discount': 'தள்ளுபடி',
    'pos.discountPlaceholder': 'தள்ளுபடி (₹)',
    'pos.apply': 'சேர்',
    'pos.tax': 'ஜி.எஸ்.டி வரி',
    'pos.totalAmount': 'மொத்த தொகை',
    'pos.clearCart': 'அழி',
    'pos.paymentMethod': 'கட்டண முறை',
    'pos.cash': 'ரொக்கம்',
    'pos.upi': 'UPI / QR',
    'pos.card': 'கார்டு',
    'pos.split': 'பிரித்து',
    'pos.amountReceived': 'வாடிக்கையாளர் தந்த தொகை (₹)',
    'pos.balanceDue': 'மீதி தரவேண்டிய தொகை',
    'pos.printAndSettle': 'பில் போட்டு அச்சிடுக',
    'pos.quickNotes': 'துரித தொகை',
    'pos.exact': 'சரியான தொகை',
    'pos.billSettled': 'பில் வெற்றிகரமாக போடப்பட்டது!',
    'pos.changeToReturn': 'வாடிக்கையாளருக்கு தரவேண்டிய சில்லறை',
    'pos.nextOrder': 'அடுத்த வாடிக்கையாளர் / புதிய பில்',
    'pos.reprint': 'மீண்டும் அச்சிடு',

    // Dashboard
    'dash.welcome': 'காரைக்குடி மெஸ் முகப்பு பலகை',
    'dash.welcomeSub': 'வணக்கம்! இன்றைய விற்பனை, ஆர்டர்கள் மற்றும் செலவுகள் கண்காணிப்பு.',
    'dash.launchPos': 'பில்லிங் கவுண்டருக்குச் செல்க',
    'dash.todaySales': 'இன்றைய விற்பனை',
    'dash.todayOrders': 'இன்றைய ஆர்டர்கள்',
    'dash.cashPayments': 'ரொக்க வசூல்',
    'dash.upiPayments': 'UPI கட்டணம்',
    'dash.totalRevenue': 'மொத்த வருவாய்',
    'dash.pendingPayments': 'நிலுவை தொகை',
    'dash.totalExpenses': 'மொத்த செலவுகள்',
    'dash.netProfit': 'நிகர லாபம்',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('km_pos_language');
      if (saved === 'en' || saved === 'ta') {
        setLanguageState(saved);
      }
    } catch (e) {
      // Ignore
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('km_pos_language', lang);
    } catch (e) {
      // Ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
