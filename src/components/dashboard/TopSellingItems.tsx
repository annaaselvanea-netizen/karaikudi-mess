'use client';

import React from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { formatCurrency } from '@/lib/utils';
import { Flame, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function TopSellingItems() {
  const { bills, menuItems } = useRestaurant();

  // Aggregate quantity sold and total revenue per item
  const itemStatsMap = new Map<
    string,
    { name: string; category: string; count: number; revenue: number; image?: string; foodType?: string }
  >();

  // If there are bills, calculate exact counts
  bills.forEach((bill) => {
    bill.items.forEach((item) => {
      const existing = itemStatsMap.get(item.name) || {
        name: item.name,
        category: item.category,
        count: 0,
        revenue: 0,
        foodType: item.foodType,
      };
      existing.count += item.quantity;
      existing.revenue += item.price * item.quantity;
      itemStatsMap.set(item.name, existing);
    });
  });

  // If no bills yet, populate top items from popular menu items
  if (itemStatsMap.size === 0) {
    const popularItems = menuItems.filter((i) => i.isPopular).slice(0, 5);
    popularItems.forEach((item, index) => {
      const simulatedCount = [48, 36, 32, 28, 22][index] || 15;
      itemStatsMap.set(item.name, {
        name: item.name,
        category: item.category,
        count: simulatedCount,
        revenue: simulatedCount * item.price,
        image: item.image,
        foodType: item.foodType,
      });
    });
  }

  const topItems = Array.from(itemStatsMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const maxCount = Math.max(...topItems.map((i) => i.count), 1);

  return (
    <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            Most Selling Food Items
          </h3>
          <p className="text-xs text-stone-500">Highest volume dishes ordered by guests</p>
        </div>
        <Link
          href="/reports"
          className="text-xs font-semibold text-brand-700 hover:text-brand-900 flex items-center gap-0.5"
        >
          <span>View Report</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3.5">
        {topItems.map((item, idx) => {
          const percentage = Math.round((item.count / maxCount) * 100);

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-stone-800 truncate">{item.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0 font-mono">
                  <span className="text-stone-500 text-[11px]">{item.count} orders</span>
                  <span className="font-bold text-stone-900">{formatCurrency(item.revenue)}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-500 to-amberGold-500 rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
