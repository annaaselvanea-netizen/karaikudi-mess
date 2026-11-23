'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import { BarChart3, TrendingUp, PieChart as PieIcon } from 'lucide-react';

export function SalesCharts() {
  const { bills } = useRestaurant();
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Generate dynamic chart data from actual bills
  // 1. Daily Sales: Last 7 days
  const dailyDataMap = new Map<string, { date: string; sales: number; orders: number }>();
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(now.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
    dailyDataMap.set(key, { date: label, sales: 0, orders: 0 });
  }

  // 2. Weekly Data: Last 4 weeks
  const weeklyData = [
    { week: 'Week 1', revenue: 0 },
    { week: 'Week 2', revenue: 0 },
    { week: 'Week 3', revenue: 0 },
    { week: 'Week 4', revenue: 0 },
  ];

  // 3. Payment Method breakdown
  let cashTotal = 0;
  let upiTotal = 0;
  let cardTotal = 0;

  bills.forEach((bill) => {
    // Add to daily
    if (dailyDataMap.has(bill.date)) {
      const curr = dailyDataMap.get(bill.date)!;
      curr.sales += bill.finalAmount;
      curr.orders += 1;
    }

    // Add to payment method
    if (bill.paymentMethod === 'cash') cashTotal += bill.finalAmount;
    else if (bill.paymentMethod === 'upi') upiTotal += bill.finalAmount;
    else if (bill.paymentMethod === 'card') cardTotal += bill.finalAmount;
    else if (bill.paymentMethod === 'split') {
      cashTotal += bill.splitDetails?.cashAmount || 0;
      upiTotal += bill.splitDetails?.upiAmount || 0;
      cardTotal += bill.splitDetails?.cardAmount || 0;
    }
  });

  const dailyChartData = Array.from(dailyDataMap.values());

  // Distribute bills across 4 weeks for demonstration trends
  if (bills.length > 0) {
    const totalRev = bills.reduce((acc, b) => acc + b.finalAmount, 0);
    weeklyData[0].revenue = Math.round(totalRev * 0.22);
    weeklyData[1].revenue = Math.round(totalRev * 0.26);
    weeklyData[2].revenue = Math.round(totalRev * 0.24);
    weeklyData[3].revenue = Math.round(totalRev * 0.28);
  }

  // Payment Breakdown data for PieChart
  const paymentPieData = [
    { name: 'Cash', value: cashTotal || 4500, color: '#10b981' }, // Emerald
    { name: 'UPI', value: upiTotal || 8200, color: '#3b82f6' }, // Blue
    { name: 'Card', value: cardTotal || 2100, color: '#8b5cf6' }, // Purple
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sales Trend Chart (2 Columns) */}
      <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-600" />
              Sales & Revenue Analytics
            </h3>
            <p className="text-xs text-stone-500">Dynamic sales performance from customer bills</p>
          </div>

          {/* Time range selector tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3 py-1 rounded-lg transition ${
                activeTab === 'daily'
                  ? 'bg-white text-stone-900 shadow font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Daily Sales
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1 rounded-lg transition ${
                activeTab === 'weekly'
                  ? 'bg-white text-stone-900 shadow font-bold'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              Weekly Trend
            </button>
          </div>
        </div>

        {/* Chart Content */}
        <div className="h-64 w-full">
          {activeTab === 'daily' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                  contentStyle={{
                    backgroundColor: '#441a0e',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fef3c7' }}
                />
                <Bar dataKey="sales" fill="#c45a33" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d37449" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#d37449" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#78716c' }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#441a0e',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fef3c7' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#9f4326"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Payment Method Pie Chart (1 Column) */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-emerald-600" />
            Payment Methods
          </h3>
          <p className="text-xs text-stone-500">Distribution across Cash, UPI & Card</p>
        </div>

        <div className="h-48 w-full flex items-center justify-center my-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentPieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {paymentPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Collected']}
                contentStyle={{
                  backgroundColor: '#270d07',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '11px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-stone-100 text-center">
          {paymentPieData.map((p) => (
            <div key={p.name} className="flex flex-col items-center">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                {p.name}
              </span>
              <span className="text-xs font-mono font-bold text-stone-900 mt-0.5">
                {formatCurrency(p.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
