'use client';

import React from 'react';
import { StatCards } from '@/components/dashboard/StatCards';
import { SalesCharts } from '@/components/dashboard/SalesCharts';
import { TopSellingItems } from '@/components/dashboard/TopSellingItems';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { UtensilsCrossed, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#441a0e] via-[#5c2313] to-amberGold-600 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase">
                Hotel Management System
              </span>
              <span className="flex items-center gap-1 text-[11px] text-amber-200">
                <Sparkles className="w-3.5 h-3.5" />
                Live Firestore Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight font-serif">
              Karaikudi Mess Dashboard
            </h1>
            <p className="text-brand-200 text-xs md:text-sm font-tamil mt-1">
              வணக்கம்! இன்றைய விற்பனை, ஆர்டர்கள் மற்றும் செலவுகள் கண்காணிப்பு
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/pos"
              className="px-5 py-3 rounded-2xl bg-white text-[#441a0e] font-extrabold text-xs shadow-md hover:bg-amber-50 transition active:scale-95 flex items-center gap-2"
            >
              <UtensilsCrossed className="w-4 h-4 text-brand-600" />
              <span>Launch POS Billing</span>
            </Link>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <UtensilsCrossed className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* 8 Main Dashboard Key Statistics */}
      <StatCards />

      {/* Analytics Charts & Trends */}
      <SalesCharts />

      {/* Top Selling Items & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopSellingItems />
        <RecentTransactions />
      </div>
    </div>
  );
}
