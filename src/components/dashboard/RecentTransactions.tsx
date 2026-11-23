'use client';

import React from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import { Receipt, Printer, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export function RecentTransactions() {
  const { bills, setActivePrintedBill } = useRestaurant();

  const recentBills = [...bills].reverse().slice(0, 6);

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Receipt className="w-4 h-4 text-brand-600" />
            Recent Billing Transactions
          </h3>
          <p className="text-xs text-stone-500">Live invoices settled at the billing counter</p>
        </div>
        <Link
          href="/orders"
          className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-0.5"
        >
          <span>All Orders</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentBills.length === 0 ? (
        <div className="h-44 flex flex-col items-center justify-center text-stone-400 text-center">
          <Receipt className="w-8 h-8 text-stone-300 mb-2" />
          <p className="text-xs font-semibold">No bills generated yet today</p>
          <Link
            href="/pos"
            className="mt-2 text-xs text-brand-700 font-bold hover:underline"
          >
            Create First Bill in POS &rarr;
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="py-2 px-3">Bill No</th>
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Payment</th>
                <th className="py-2 px-3 text-right">Amount</th>
                <th className="py-2 px-3 text-center">Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-amber-50/40 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-950">
                    {bill.billNumber}
                    <span className="block text-[10px] font-normal text-stone-400">
                      {bill.time}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-stone-800">{bill.customerName}</span>
                    <span className="block text-[10px] text-stone-400">
                      {bill.items.length} items
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block uppercase text-[9px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {bill.orderType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block uppercase text-[10px] font-semibold text-emerald-700">
                      {bill.paymentMethod}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-stone-900">
                    {formatCurrency(bill.finalAmount)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => setActivePrintedBill(bill)}
                      className="p-1 rounded text-stone-400 hover:text-brand-700 hover:bg-brand-50 transition"
                      title="Reprint Receipt"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
