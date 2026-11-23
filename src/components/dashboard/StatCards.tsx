'use client';

import React from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import {
  IndianRupee,
  ShoppingBag,
  Banknote,
  QrCode,
  TrendingUp,
  Clock,
  Receipt,
  PiggyBank,
} from 'lucide-react';

export function StatCards() {
  const { bills, orders, expenses } = useRestaurant();
  const { language, t } = useLanguage();

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter today's data
  const todayBills = bills.filter((b) => b.date === todayStr);
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayExpenses = expenses.filter((e) => e.date === todayStr);

  // 1. Today's Total Sales
  const todaySales = todayBills.reduce((acc, b) => acc + b.finalAmount, 0);

  // 2. Today's Total Orders
  const todayOrdersCount = todayOrders.length > 0 ? todayOrders.length : todayBills.length;

  // 3. Cash Payments (today)
  const todayCash = todayBills.reduce((acc, b) => {
    if (b.paymentMethod === 'cash') return acc + b.finalAmount;
    if (b.paymentMethod === 'split' && b.splitDetails?.cashAmount) {
      return acc + b.splitDetails.cashAmount;
    }
    return acc;
  }, 0);

  // 4. UPI Payments (today)
  const todayUpi = todayBills.reduce((acc, b) => {
    if (b.paymentMethod === 'upi') return acc + b.finalAmount;
    if (b.paymentMethod === 'split' && b.splitDetails?.upiAmount) {
      return acc + b.splitDetails.upiAmount;
    }
    return acc;
  }, 0);

  // 5. Total Revenue (all-time or month)
  const totalRevenue = bills.reduce((acc, b) => acc + b.finalAmount, 0);

  // 6. Pending Payments
  const pendingOrders = orders.filter((o) => o.paymentStatus === 'pending');
  const pendingPaymentsAmount = pendingOrders.reduce((acc, o) => acc + o.finalAmount, 0);

  // 7. Total Expenses (all-time)
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // 8. Net Profit = Total Revenue - Total Expenses
  const netProfit = totalRevenue - totalExpenses;

  const stats = [
    {
      title: "Today's Total Sales",
      tamilTitle: 'இன்றைய விற்பனை',
      value: formatCurrency(todaySales),
      icon: IndianRupee,
      trend: `${todayBills.length} bills settled today`,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      iconColor: 'bg-emerald-600 text-white',
    },
    {
      title: "Today's Total Orders",
      tamilTitle: 'இன்றைய ஆர்டர்கள்',
      value: `${todayOrdersCount} Orders`,
      icon: ShoppingBag,
      trend: 'Dine-in & Parcels',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      iconColor: 'bg-amber-600 text-white',
    },
    {
      title: 'Cash Payments',
      tamilTitle: 'ரொக்க வசூல்',
      value: formatCurrency(todayCash),
      icon: Banknote,
      trend: 'Cash drawer balance',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      iconColor: 'bg-blue-600 text-white',
    },
    {
      title: 'UPI Payments',
      tamilTitle: 'UPI கட்டணம்',
      value: formatCurrency(todayUpi),
      icon: QrCode,
      trend: 'GPay, PhonePe, Paytm',
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      iconColor: 'bg-indigo-600 text-white',
    },
    {
      title: 'Total Revenue',
      tamilTitle: 'மொத்த வருவாய்',
      value: formatCurrency(totalRevenue),
      icon: TrendingUp,
      trend: `${bills.length} total lifetime bills`,
      color: 'bg-violet-50 text-violet-700 border-violet-200',
      iconColor: 'bg-violet-600 text-white',
    },
    {
      title: 'Pending Payments',
      tamilTitle: 'நிலுவை தொகை',
      value: formatCurrency(pendingPaymentsAmount),
      icon: Clock,
      trend: `${pendingOrders.length} pending orders`,
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      iconColor: 'bg-rose-600 text-white',
    },
    {
      title: 'Total Expenses',
      tamilTitle: 'மொத்த செலவுகள்',
      value: formatCurrency(totalExpenses),
      icon: Receipt,
      trend: `${expenses.length} expense entries`,
      color: 'bg-orange-50 text-orange-800 border-orange-200',
      iconColor: 'bg-orange-600 text-white',
    },
    {
      title: 'Net Profit',
      tamilTitle: 'நிகர லாபம்',
      value: formatCurrency(netProfit),
      icon: PiggyBank,
      trend: 'Revenue - Expenses',
      color: netProfit >= 0 ? 'bg-teal-50 text-teal-800 border-teal-200' : 'bg-red-50 text-red-800 border-red-200',
      iconColor: netProfit >= 0 ? 'bg-teal-600 text-white' : 'bg-red-600 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        const mainTitle = language === 'ta' ? stat.tamilTitle : stat.title;
        const subTitle = language === 'ta' ? stat.title : stat.tamilTitle;

        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-md ${stat.color} flex flex-col justify-between`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className={`text-xs font-bold uppercase tracking-wider opacity-90 ${language === 'ta' ? 'font-tamil text-[13px]' : ''}`}>
                  {mainTitle}
                </p>
                <p className="text-[10px] opacity-65 font-tamil">{subTitle}</p>
              </div>
              <div className={`p-2 rounded-xl shadow-xs shrink-0 ${stat.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <h3 className="text-xl font-black font-mono tracking-tight leading-none">
                {stat.value}
              </h3>
              <p className="text-[11px] opacity-75 mt-1">{stat.trend}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
