'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
  TrendingUp,
  Receipt,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';

export function ReportsView() {
  const { bills, expenses, menuItems, settings } = useRestaurant();

  const [reportType, setReportType] = useState<
    'daily' | 'food_sales' | 'payment_method' | 'profit_loss' | 'expenses'
  >('daily');

  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter bills and expenses by date range
  const filteredBills = bills.filter((b) => b.date >= startDate && b.date <= endDate);
  const filteredExpenses = expenses.filter((e) => e.date >= startDate && e.date <= endDate);

  // Totals
  const totalSales = filteredBills.reduce((acc, b) => acc + b.finalAmount, 0);
  const totalExpenses = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalSales - totalExpenses;

  // Food Item Breakdown
  const foodItemMap = new Map<string, { name: string; category: string; qty: number; sales: number }>();
  filteredBills.forEach((b) => {
    b.items.forEach((i) => {
      const cur = foodItemMap.get(i.name) || {
        name: i.name,
        category: i.category,
        qty: 0,
        sales: 0,
      };
      cur.qty += i.quantity;
      cur.sales += i.price * i.quantity;
      foodItemMap.set(i.name, cur);
    });
  });
  const foodSalesReport = Array.from(foodItemMap.values()).sort((a, b) => b.sales - a.sales);

  // Payment Breakdown
  let cashSales = 0;
  let upiSales = 0;
  let cardSales = 0;
  filteredBills.forEach((b) => {
    if (b.paymentMethod === 'cash') cashSales += b.finalAmount;
    else if (b.paymentMethod === 'upi') upiSales += b.finalAmount;
    else if (b.paymentMethod === 'card') cardSales += b.finalAmount;
    else if (b.paymentMethod === 'split') {
      cashSales += b.splitDetails?.cashAmount || 0;
      upiSales += b.splitDetails?.upiAmount || 0;
      cardSales += b.splitDetails?.cardAmount || 0;
    }
  });

  // Export Excel (.xlsx)
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Sales Records
    const salesData = filteredBills.map((b) => ({
      'Bill ID': b.billNumber,
      'Date': b.date,
      'Time': b.time,
      'Customer Name': b.customerName || 'Walk-in',
      'Order Type': b.orderType,
      'Food Items': b.items.map((i) => `${i.name} (x${i.quantity})`).join(', '),
      'Subtotal (₹)': b.subtotal,
      'Discount (₹)': b.discount,
      'Tax (₹)': b.taxAmount,
      'Total Amount (₹)': b.finalAmount,
      'Payment Method': b.paymentMethod,
      'Payment Status': b.paymentStatus,
    }));
    const wsSales = XLSX.utils.json_to_sheet(salesData);
    XLSX.utils.book_append_sheet(wb, wsSales, 'Sales Records');

    // Sheet 2: Food Sales Report
    const foodData = foodSalesReport.map((f) => ({
      'Food Name': f.name,
      'Category': f.category,
      'Total Quantity Sold': f.qty,
      'Total Sales Amount (₹)': f.sales,
    }));
    const wsFood = XLSX.utils.json_to_sheet(foodData);
    XLSX.utils.book_append_sheet(wb, wsFood, 'Food Sales Report');

    // Sheet 3: Expenses
    const expenseData = filteredExpenses.map((e) => ({
      'Expense ID': e.expenseNumber,
      'Date': e.date,
      'Category': e.category,
      'Description': e.description,
      'Amount (₹)': e.amount,
      'Payment Method': e.paymentMethod,
    }));
    const wsExpenses = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, wsExpenses, 'Expenses');

    XLSX.writeFile(wb, `Karaikudi_Mess_Report_${startDate}_to_${endDate}.xlsx`);
  };

  // Export PDF
  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${settings.name.toUpperCase()} - FINANCIAL REPORT`, 14, 18);
    doc.setFontSize(10);
    doc.text(`Period: ${formatDateOnly(startDate)} to ${formatDateOnly(endDate)}`, 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    let y = 40;
    doc.setFontSize(12);
    doc.text('Summary of Performance:', 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Total Sales Revenue: Rs. ${totalSales.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Total Orders Settled: ${filteredBills.length}`, 14, y);
    y += 6;
    doc.text(`Total Expenses: Rs. ${totalExpenses.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`Net Profit: Rs. ${netProfit.toFixed(2)}`, 14, y);

    y += 12;
    doc.text('Payment Method Breakdown:', 14, y);
    y += 6;
    doc.text(`- Cash: Rs. ${cashSales.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`- UPI: Rs. ${upiSales.toFixed(2)}`, 14, y);
    y += 6;
    doc.text(`- Card: Rs. ${cardSales.toFixed(2)}`, 14, y);

    doc.save(`Karaikudi_Mess_Report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="space-y-5">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            Restaurant Reports & Financial Analytics
          </h2>
          <p className="text-xs text-stone-500 font-tamil mt-0.5">
            விற்பனை அறிக்கைகள், உணவுப் பொருட்கள் பகுப்பாய்வு & லாப நட்டக் கணக்கு
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>
          <button
            onClick={handleExportPdf}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF Report</span>
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Date Range Picker Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Report Type Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto text-xs font-semibold">
          <button
            onClick={() => setReportType('daily')}
            className={`px-3 py-1.5 rounded-xl transition ${
              reportType === 'daily'
                ? 'bg-[#441a0e] text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Sales Register
          </button>
          <button
            onClick={() => setReportType('food_sales')}
            className={`px-3 py-1.5 rounded-xl transition ${
              reportType === 'food_sales'
                ? 'bg-[#441a0e] text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Food Sales Report
          </button>
          <button
            onClick={() => setReportType('payment_method')}
            className={`px-3 py-1.5 rounded-xl transition ${
              reportType === 'payment_method'
                ? 'bg-[#441a0e] text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Payment Modes
          </button>
          <button
            onClick={() => setReportType('profit_loss')}
            className={`px-3 py-1.5 rounded-xl transition ${
              reportType === 'profit_loss'
                ? 'bg-[#441a0e] text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Profit & Loss
          </button>
        </div>

        {/* Date Selectors */}
        <div className="flex items-center gap-2 self-stretch md:self-auto text-xs">
          <Calendar className="w-4 h-4 text-stone-400" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
          />
          <span className="text-stone-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Period Sales</span>
          <p className="text-lg font-black font-mono text-emerald-700 mt-0.5">
            {formatCurrency(totalSales)}
          </p>
          <p className="text-[10px] text-stone-400">{filteredBills.length} Bills Settled</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Period Expenses</span>
          <p className="text-lg font-black font-mono text-red-600 mt-0.5">
            {formatCurrency(totalExpenses)}
          </p>
          <p className="text-[10px] text-stone-400">{filteredExpenses.length} Expense Logs</p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Net Margin</span>
          <p
            className={`text-lg font-black font-mono mt-0.5 ${
              netProfit >= 0 ? 'text-teal-700' : 'text-rose-700'
            }`}
          >
            {formatCurrency(netProfit)}
          </p>
          <p className="text-[10px] text-stone-400">
            {totalSales > 0 ? `${Math.round((netProfit / totalSales) * 100)}% Profit Margin` : '-'}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase">Average Bill Size</span>
          <p className="text-lg font-black font-mono text-stone-900 mt-0.5">
            {formatCurrency(filteredBills.length > 0 ? totalSales / filteredBills.length : 0)}
          </p>
          <p className="text-[10px] text-stone-400">Per Customer Order</p>
        </div>
      </div>

      {/* Report Content Tables */}
      {reportType === 'daily' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-200 font-bold text-sm text-stone-800">
            Detailed Sales Records (Sheet 1)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#441a0e] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-3">Bill ID</th>
                  <th className="py-2.5 px-3">Date & Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Dishes</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                  <th className="py-2.5 px-3 text-right">Discount</th>
                  <th className="py-2.5 px-3 text-right">Tax</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                  <th className="py-2.5 px-3">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredBills.map((b) => (
                  <tr key={b.id} className="hover:bg-amber-50/40">
                    <td className="py-2.5 px-3 font-mono font-bold text-brand-950">
                      {b.billNumber}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600">
                      {b.date} {b.time}
                    </td>
                    <td className="py-2.5 px-3">{b.customerName || 'Walk-in'}</td>
                    <td className="py-2.5 px-3 uppercase text-[10px] font-bold">{b.orderType}</td>
                    <td className="py-2.5 px-3 max-w-xs truncate text-stone-600">
                      {b.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(b.subtotal)}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-red-600">
                      {b.discount > 0 ? `-${formatCurrency(b.discount)}` : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{formatCurrency(b.taxAmount)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(b.finalAmount)}
                    </td>
                    <td className="py-2.5 px-3 uppercase font-semibold text-emerald-700">
                      {b.paymentMethod}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'food_sales' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-stone-200 font-bold text-sm text-stone-800">
            Food Sales Report (Sheet 3)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#441a0e] text-white uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">Rank</th>
                  <th className="py-2.5 px-4">Dish Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4 text-center">Total Quantity Sold</th>
                  <th className="py-2.5 px-4 text-right">Total Revenue (₹)</th>
                  <th className="py-2.5 px-4 text-right">% of Food Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {foodSalesReport.map((item, idx) => {
                  const pct = totalSales > 0 ? ((item.sales / totalSales) * 100).toFixed(1) : '0';
                  return (
                    <tr key={idx} className="hover:bg-amber-50/40">
                      <td className="py-2.5 px-4 text-center font-bold text-stone-500">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-bold text-stone-900">{item.name}</td>
                      <td className="py-2.5 px-4 text-stone-600">{item.category}</td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-sm">
                        {item.qty}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-stone-900">
                        {formatCurrency(item.sales)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-stone-600">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'payment_method' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase">Cash Collection</span>
              <p className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {formatCurrency(cashSales)}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {totalSales > 0 ? ((cashSales / totalSales) * 100).toFixed(1) : 0}% of total sales
              </p>
            </div>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase">UPI Digital Collection</span>
              <p className="text-2xl font-black text-blue-700 font-mono mt-1">
                {formatCurrency(upiSales)}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {totalSales > 0 ? ((upiSales / totalSales) * 100).toFixed(1) : 0}% of total sales
              </p>
            </div>
          </div>
          <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase">Card Swipe Collection</span>
              <p className="text-2xl font-black text-purple-700 font-mono mt-1">
                {formatCurrency(cardSales)}
              </p>
              <p className="text-xs text-stone-500 mt-1">
                {totalSales > 0 ? ((cardSales / totalSales) * 100).toFixed(1) : 0}% of total sales
              </p>
            </div>
          </div>
        </div>
      )}

      {reportType === 'profit_loss' && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm max-w-2xl mx-auto space-y-4">
          <h3 className="font-bold text-base text-stone-900 border-b pb-3">
            Profit and Loss Statement (P&L)
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span className="font-semibold text-stone-800">Gross Food & Beverage Revenue</span>
              <span className="font-mono font-bold text-stone-900">{formatCurrency(totalSales)}</span>
            </div>
            <div className="flex justify-between py-1 border-b text-red-600">
              <span>Total Cost of Goods & Operating Expenses</span>
              <span className="font-mono font-bold">-{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-stone-900 text-sm font-black text-[#441a0e]">
              <span>NET OPERATING PROFIT</span>
              <span className="font-mono text-base">{formatCurrency(netProfit)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
