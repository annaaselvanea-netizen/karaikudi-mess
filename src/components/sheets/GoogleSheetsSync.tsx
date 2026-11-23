'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import { syncBillToGoogleSheets, syncExpenseToGoogleSheets } from '@/lib/sheets-service';
import { dbService } from '@/lib/db-service';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

export function GoogleSheetsSync() {
  const { bills, expenses, settings, updateSettings, showToast, refreshBills } = useRestaurant();

  const [activeSheetTab, setActiveSheetTab] = useState<'sheet1' | 'sheet2' | 'sheet3' | 'sheet4'>(
    'sheet1'
  );
  const [webhookUrlInput, setWebhookUrlInput] = useState(settings.sheetsWebhookUrl || '');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(settings.sheetsAutoSync);
  const [isSyncing, setIsSyncing] = useState(false);

  // Unsynced counts
  const unsyncedBills = bills.filter((b) => !b.syncedToSheets);
  const syncedBills = bills.filter((b) => b.syncedToSheets);

  // Save Settings
  const handleSaveWebhook = async () => {
    await updateSettings({
      ...settings,
      sheetsWebhookUrl: webhookUrlInput.trim(),
      sheetsAutoSync: autoSyncEnabled,
    });
    showToast('Google Sheets settings saved!');
  };

  // Sync All Pending Bills
  const handleSyncAllPending = async () => {
    if (unsyncedBills.length === 0) {
      showToast('All bills are already synchronized with Google Sheets!', 'info');
      return;
    }

    setIsSyncing(true);
    let successCount = 0;

    for (const bill of unsyncedBills) {
      try {
        const res = await syncBillToGoogleSheets(bill, settings.sheetsWebhookUrl);
        if (res.success) {
          await dbService.updateBillSyncStatus(bill.id, true);
          successCount++;
        }
      } catch (err) {
        console.error('Failed syncing bill:', bill.billNumber, err);
      }
    }

    await refreshBills();
    setIsSyncing(false);
    showToast(`Successfully synchronized ${successCount} bill(s) to Google Sheets!`);
  };

  // Aggregate Data for Sheet 2: Daily Sales
  const dailySummaryMap = new Map<
    string,
    { date: string; orders: number; cash: number; upi: number; card: number; revenue: number }
  >();

  bills.forEach((b) => {
    const cur = dailySummaryMap.get(b.date) || {
      date: b.date,
      orders: 0,
      cash: 0,
      upi: 0,
      card: 0,
      revenue: 0,
    };
    cur.orders += 1;
    cur.revenue += b.finalAmount;
    if (b.paymentMethod === 'cash') cur.cash += b.finalAmount;
    else if (b.paymentMethod === 'upi') cur.upi += b.finalAmount;
    else if (b.paymentMethod === 'card') cur.card += b.finalAmount;
    else if (b.paymentMethod === 'split') {
      cur.cash += b.splitDetails?.cashAmount || 0;
      cur.upi += b.splitDetails?.upiAmount || 0;
      cur.card += b.splitDetails?.cardAmount || 0;
    }
    dailySummaryMap.set(b.date, cur);
  });
  const sheet2Data = Array.from(dailySummaryMap.values());

  // Aggregate Data for Sheet 3: Food Sales
  const foodMap = new Map<string, { name: string; category: string; qty: number; sales: number }>();
  bills.forEach((b) => {
    b.items.forEach((i) => {
      const cur = foodMap.get(i.name) || {
        name: i.name,
        category: i.category,
        qty: 0,
        sales: 0,
      };
      cur.qty += i.quantity;
      cur.sales += i.price * i.quantity;
      foodMap.set(i.name, cur);
    });
  });
  const sheet3Data = Array.from(foodMap.values()).sort((a, b) => b.sales - a.sales);

  return (
    <div className="space-y-5">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            Google Sheets Real-time Synchronization
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                settings.sheetsWebhookUrl
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {settings.sheetsWebhookUrl ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Connected Webhook
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Local Buffer Active
                </>
              )}
            </span>
          </h2>
          <p className="text-xs text-stone-500 font-tamil mt-0.5">
            பில்லிங் தரவுகள் தானாக கூகுள் தாள்களில் (Google Sheets) பதிவேற்றப்படும்
          </p>
        </div>

        <button
          onClick={handleSyncAllPending}
          disabled={isSyncing || unsyncedBills.length === 0}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow transition active:scale-95 ${
            unsyncedBills.length === 0
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
              : 'bg-emerald-700 hover:bg-emerald-800 text-white'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing ? 'Syncing...' : `Sync ${unsyncedBills.length} Pending Bills Now`}
          </span>
        </button>
      </div>

      {/* Webhook Configuration Box */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Google Apps Script Web App Integration
        </h3>
        <p className="text-xs text-stone-500">
          Paste your Google Apps Script Web App URL below. When staff generates a bill, it is
          automatically routed through the backend without leaking service credentials.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={webhookUrlInput}
            onChange={(e) => setWebhookUrlInput(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono"
          />
          <button
            onClick={handleSaveWebhook}
            className="px-4 py-2 bg-[#441a0e] hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition"
          >
            Save URL
          </button>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer text-stone-700">
            <input
              type="checkbox"
              checked={autoSyncEnabled}
              onChange={(e) => setAutoSyncEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <span className="font-medium">
              Automatically synchronize each bill immediately after payment
            </span>
          </label>

          <div className="text-stone-500">
            Synced: <span className="font-bold text-emerald-700">{syncedBills.length}</span> |
            Pending:{' '}
            <span className="font-bold text-amber-700">{unsyncedBills.length}</span>
          </div>
        </div>
      </div>

      {/* Tabs for the 4 Sheets */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Tab Header */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-2 gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSheetTab('sheet1')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSheetTab === 'sheet1'
                ? 'bg-emerald-700 text-white shadow font-bold'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Sheet 1: Sales Records
          </button>
          <button
            onClick={() => setActiveSheetTab('sheet2')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSheetTab === 'sheet2'
                ? 'bg-emerald-700 text-white shadow font-bold'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Sheet 2: Daily Sales
          </button>
          <button
            onClick={() => setActiveSheetTab('sheet3')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSheetTab === 'sheet3'
                ? 'bg-emerald-700 text-white shadow font-bold'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Sheet 3: Food Sales Report
          </button>
          <button
            onClick={() => setActiveSheetTab('sheet4')}
            className={`px-3 py-2 rounded-xl transition ${
              activeSheetTab === 'sheet4'
                ? 'bg-emerald-700 text-white shadow font-bold'
                : 'text-stone-600 hover:bg-stone-200'
            }`}
          >
            Sheet 4: Expenses
          </button>
        </div>

        {/* Tab 1: Sales Records */}
        {activeSheetTab === 'sheet1' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#441a0e] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Order Type</th>
                  <th className="py-2.5 px-3">Food Items</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Total Amount</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-center">Sync Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-900">
                      {b.billNumber}
                    </td>
                    <td className="py-2.5 px-3">{b.date}</td>
                    <td className="py-2.5 px-3">{b.time}</td>
                    <td className="py-2.5 px-3">{b.customerName || 'Walk-in'}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold">{b.orderType}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-stone-600">
                      {b.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(b.subtotal)}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(b.taxAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(b.finalAmount)}
                    </td>
                    <td className="py-2.5 px-3 uppercase text-emerald-700 font-semibold">
                      {b.paymentMethod}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {b.syncedToSheets ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Synced
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-[10px]">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Daily Sales */}
        {activeSheetTab === 'sheet2' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#441a0e] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4 text-center">Total Orders</th>
                  <th className="py-2.5 px-4 text-right">Cash Sales (₹)</th>
                  <th className="py-2.5 px-4 text-right">UPI Sales (₹)</th>
                  <th className="py-2.5 px-4 text-right">Card Sales (₹)</th>
                  <th className="py-2.5 px-4 text-right font-bold">Total Revenue (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sheet2Data.map((row) => (
                  <tr key={row.date} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-4 font-mono font-bold">{row.date}</td>
                    <td className="py-2.5 px-4 text-center font-bold">{row.orders}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(row.cash)}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(row.upi)}</td>
                    <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(row.card)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-stone-900 text-sm">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Food Sales Report */}
        {activeSheetTab === 'sheet3' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#441a0e] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Food Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Total Quantity Sold</th>
                  <th className="py-2.5 px-4 text-right">Total Sales Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {sheet3Data.map((row) => (
                  <tr key={row.name} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-4 font-bold text-stone-900">{row.name}</td>
                    <td className="py-2.5 px-4 text-stone-600">{row.category}</td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-sm">
                      {row.qty}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-stone-900">
                      {formatCurrency(row.sales)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Expenses */}
        {activeSheetTab === 'sheet4' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#441a0e] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Expense ID</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Expense Category</th>
                  <th className="py-2.5 px-4">Description</th>
                  <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-4 font-mono font-bold text-brand-900">
                      {exp.expenseNumber}
                    </td>
                    <td className="py-2.5 px-4">{exp.date}</td>
                    <td className="py-2.5 px-4 font-semibold text-stone-800">{exp.category}</td>
                    <td className="py-2.5 px-4 text-stone-700">{exp.description}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-black text-red-600">
                      {formatCurrency(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
