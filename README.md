# Karaikudi Mess – Hotel Billing & Restaurant Management System

A modern, responsive, high-performance Restaurant POS, Hotel Billing, and Management Web Application built specifically for **Karaikudi Mess**.

Developed with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Firebase Firestore**, **Recharts**, and dual thermal/A4 printing support.

---

## 🌟 Key Features

### 1. Main Dashboard
- **8 Dynamic Metric Cards**: Today's Total Sales, Today's Total Orders, Cash Payments, UPI Payments, Total Revenue, Pending Payments, Total Expenses, and Net Profit ($Revenue - Expenses$).
- **Live Interactive Charts**:
  - Daily sales bar chart & weekly revenue area chart
  - Payment method breakdown pie chart (Cash, UPI, Card)
  - Top 5 most selling food items with order count and volume bars
  - Real-time transaction feed with instant receipt reprint

### 2. Fast POS Billing Terminal (`/pos`)
- **Chettinad Heritage Theme**: Rich terracotta, deep brown (`#441a0e`), saffron orange, and warm cream tones.
- **Categorized Food Menu Grid**: Breakfast, Lunch, Dinner, Chettinad Non-Veg, Chettinad Veg, Snacks, Beverages, Extra Items.
- **Instant Search & Pure Veg / Non-Veg Filtering**: Search in English or Tamil (தமிழ்).
- **Interactive Cart**:
  - Quantity increase/decrease and one-click removal
  - Dine-In (with Table T1–T24 and Family Rooms), Takeaway, and Parcel order types
  - Special preparation instructions per item (e.g., "Less spicy", "No onion")
  - Automatic Subtotal, Flat/Percentage Discount, 5% GST calculation, and Grand Total
- **Flexible Multi-Payment Checkout**:
  - Cash (with Quick Note tender buttons ₹100, ₹500, etc. and real-time Change Due calculation)
  - UPI / QR Code preview
  - Card / POS
  - Split Payment (combining Cash + UPI + Card)

### 3. Dual Printing System
- **Thermal Printer Support (58mm & 80mm)**:
  - Toggle between 58mm compact roll and 80mm standard paper in Settings.
  - Dedicated `@media print` CSS rules formatted strictly for monospace thermal rolls.
  - Generates raw ESC/POS binary buffers (`.bin`) for local printer bridges and ESC/POS spoolers.
  - Browser-based thermal print preview with thank you note ("நன்றி! மீண்டும் வருக!").
- **Professional A4 Tax Invoice**:
  - Formal GST-compliant Tax Invoice formatted for standard A4 paper.
  - Includes GSTIN, FSSAI License Number, itemized rates, CGST/SGST tax split, and authorized signatory.
  - Single-click **Download PDF** using jsPDF or direct **Print A4**.

### 4. Food Menu Management (`/menu`)
- Add new dishes, edit prices, descriptions, and categories.
- Pure Veg vs Non-Veg classification.
- Instant "In Stock" / "Out of Stock" availability toggle.
- Chef's Special / Popular badge toggle.
- One-click "Reset Sample Menu" with 28 authentic Karaikudi Chettinad dishes.

### 5. Order Management & Kitchen Display System (`/orders`)
- **Table View**: Live order list with Token #, Bill #, customer name, date/time, and status changer.
- **Kitchen Display System (KDS)**: Dedicated chef card view showing item quantities, special notes, and one-click status transitions (Pending $\to$ Preparing $\to$ Completed).

### 6. Expense Management (`/expenses`)
- Record daily procurement costs: Vegetables, Meat & Poultry, Groceries, Dairy, Staff Salary, LPG Gas, Maintenance, and Rent.
- Real-time **Net Profit** calculation ($Total Revenue - Total Expenses$).
- Auto-syncs to Google Sheets Sheet 4.

### 7. Reports & Financial Analytics (`/reports`)
- Date range picker (custom start and end date).
- Detailed Sales Register (Sheet 1 format).
- Ranked Food Sales report with revenue percentages.
- Payment mode collection breakdown.
- Profit & Loss statement (P&L).
- Export to Excel (`.xlsx`) via SheetJS and Download PDF via jsPDF.

### 8. Google Sheets Real-time Synchronization (`/sheets`)
- Connects directly to Google Apps Script Web App without exposing Google service credentials in frontend code.
- Automatic or manual sync for:
  - **Sheet 1**: Sales Records
  - **Sheet 2**: Daily Sales Summary
  - **Sheet 3**: Food Sales Report
  - **Sheet 4**: Expenses
- Built-in duplicate prevention via `syncedToSheets` tracking flags.
- Ready-to-deploy script provided in `google-apps-script.js`.

### 9. Role-Based Authentication (`/login`)
- **Admin**: Full access to all modules, settings, expenses, reports, and menu editing.
- **Cashier**: Fast POS Billing, payments, receipts, and order viewing.
- **Staff**: Kitchen Display System and order status updates.
- Quick 1-click role switcher in header and login page for rapid workflow testing.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + Custom Chettinad Heritage Theme |
| **Icons** | Lucide React |
| **Database** | Firebase Firestore (with local offline resilience) |
| **Authentication**| Firebase Auth + Role Based Access Control |
| **Charts** | Recharts (Responsive bar, area, pie charts) |
| **Export & PDF** | jsPDF + XLSX (Excel) |
| **Sheets Sync** | Google Apps Script Web App Endpoint |
| **Printing** | ESC/POS binary generator + Thermal CSS + A4 Layout |

---

## 🚀 Getting Started

### 1. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Building for Production
```bash
npm run build
npm start
```

### 3. Setting Up Google Sheets Sync
1. Open Google Sheets and create a new spreadsheet.
2. Open **Extensions** $\to$ **Apps Script**.
3. Copy the script from `google-apps-script.js` into `Code.gs`.
4. Deploy as **Web app** with access set to **Anyone**.
5. Copy the generated Web App URL and paste it into **Settings** $\to$ **Google Sheets Webhook URL** in the POS app.
