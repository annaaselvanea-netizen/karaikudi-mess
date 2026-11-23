'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { Expense, ExpenseCategory } from '@/types';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import {
  Receipt,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  X,
  PieChart as PieIcon,
} from 'lucide-react';
import { syncExpenseToGoogleSheets } from '@/lib/sheets-service';

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Vegetables',
  'Meat & Poultry',
  'Groceries',
  'Dairy',
  'Staff Salary',
  'LPG & Fuel',
  'Maintenance',
  'Rent',
  'Electricity',
  'Miscellaneous',
];

export function ExpenseManagement() {
  const { expenses, addExpense, deleteExpense, bills, settings } = useRestaurant();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState<ExpenseCategory>('Vegetables');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card' | 'bank_transfer'>('cash');
  const [vendorName, setVendorName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter((e) => e.date === todayStr);
  const todayExpensesTotal = todayExpenses.reduce((acc, e) => acc + e.amount, 0);

  const totalRevenue = bills.reduce((acc, b) => acc + b.finalAmount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    const newExpense: Expense = {
      id: 'exp-' + Date.now(),
      expenseNumber: `EXP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      date,
      time: new Date().toLocaleTimeString('en-IN', { hour12: false }),
      category,
      description: description.trim(),
      amount,
      paymentMethod,
      vendorName: vendorName.trim() || undefined,
      createdAt: new Date().toISOString(),
      syncedToSheets: false,
    };

    await addExpense(newExpense);

    // Sync to Google Sheets Sheet 4: Expenses if enabled
    if (settings.sheetsAutoSync) {
      syncExpenseToGoogleSheets(newExpense, settings.sheetsWebhookUrl);
    }

    setIsModalOpen(false);
    setDescription('');
    setAmount(500);
    setVendorName('');
  };

  const filteredExpenses = expenses.filter(
    (e) => selectedCategory === 'All' || e.category === selectedCategory
  );

  return (
    <div className="space-y-5">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            Expense Management & Tracking
            <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-900 font-bold">
              {expenses.length} Records
            </span>
          </h2>
          <p className="text-xs text-stone-500 font-tamil mt-0.5">
            தினசரி காய்கறி, மளிகை, ஆட்டிறைச்சி & நிர்வாகச் செலவுப் பதிவேடு
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Daily Expense</span>
        </button>
      </div>

      {/* Overview Stat Banners: Revenue, Expense, Net Profit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
              {formatCurrency(totalRevenue)}
            </p>
            <p className="text-[11px] text-stone-500">{bills.length} Total Billing Receipts</p>
          </div>
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <p className="text-2xl font-black text-red-700 font-mono mt-0.5">
              {formatCurrency(totalExpenses)}
            </p>
            <p className="text-[11px] text-stone-500">
              Today: {formatCurrency(todayExpensesTotal)}
            </p>
          </div>
          <div className="p-3 bg-red-100 text-red-800 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Net Profit (Revenue - Expenses)
            </span>
            <p
              className={`text-2xl font-black font-mono mt-0.5 ${
                netProfit >= 0 ? 'text-teal-700' : 'text-rose-700'
              }`}
            >
              {formatCurrency(netProfit)}
            </p>
            <p className="text-[11px] text-stone-500">Real-time profitability margin</p>
          </div>
          <div
            className={`p-3 rounded-2xl ${
              netProfit >= 0 ? 'bg-teal-100 text-teal-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setSelectedCategory('All')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
            selectedCategory === 'All'
              ? 'bg-[#441a0e] text-white shadow'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All Categories
        </button>
        {EXPENSE_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-[#441a0e] text-white shadow'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#441a0e] text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Vendor / Paid To</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-3 px-4 font-mono font-bold text-brand-900">
                    {exp.expenseNumber}
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {formatDateOnly(exp.date)}
                    <span className="block text-[10px] text-stone-400">{exp.time}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-semibold text-[11px]">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 max-w-sm">
                    <span className="text-stone-800 font-medium">{exp.description}</span>
                  </td>
                  <td className="py-3 px-4 text-stone-600">
                    {exp.vendorName || '-'}
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[10px] text-stone-600">
                    {exp.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-black text-red-600 text-sm">
                    {formatCurrency(exp.amount)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm('Delete this expense entry?')) {
                          deleteExpense(exp.id);
                        }
                      }}
                      className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-stone-200">
            <div className="flex items-center justify-between px-6 py-4 bg-[#441a0e] text-white">
              <h3 className="font-bold text-base">Record Daily Restaurant Expense</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {EXPENSE_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Expense Description *</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Shallots & Tomatoes from Sandhai"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Payment Method *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI / GPay</option>
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Vendor / Store Name</label>
                <input
                  type="text"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="e.g. Madurai Vegetable Market"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 text-white rounded-xl font-bold shadow"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
