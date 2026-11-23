'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRestaurant } from '@/context/RestaurantContext';
import {
  Clock,
  Calendar,
  UtensilsCrossed,
  Bell,
  Sparkles,
  ShoppingBag,
  User,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { formatTimeOnly, formatDateOnly } from '@/lib/utils';

export function Header({ onMobileMenuToggle }: { onMobileMenuToggle?: () => void }) {
  const { currentUser, loginAs, logout } = useAuth();
  const { settings, orders } = useRestaurant();
  const [time, setTime] = useState<Date>(new Date());
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'preparing').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#441a0e] text-amber-50 shadow-md border-b border-brand-800">
      {/* Left: Mobile hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 text-brand-200 hover:text-white lg:hidden rounded-md hover:bg-brand-900 transition"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-500 to-amberGold-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
            KM
          </div>
          <div className="hidden sm:block">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 leading-none">
              {settings.name || 'Karaikudi Mess'}
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-brand-700/70 text-brand-200 font-medium">
                POS
              </span>
            </h1>
            <p className="text-[11px] text-brand-300 font-tamil mt-0.5">
              {settings.tamilName || 'காரைக்குடி பாரம்பரிய மெஸ்'}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Live Clock & Date */}
      <div className="hidden md:flex items-center gap-6 bg-brand-900/60 py-1.5 px-4 rounded-full border border-brand-700/50 text-xs">
        <div className="flex items-center gap-1.5 text-brand-200">
          <Calendar className="w-3.5 h-3.5 text-brand-400" />
          <span>{formatDateOnly(time)}</span>
        </div>
        <div className="h-3 w-px bg-brand-700" />
        <div className="flex items-center gap-1.5 text-amber-300 font-mono font-medium tracking-wide">
          <Clock className="w-3.5 h-3.5 text-brand-400" />
          <span>{formatTimeOnly(time)}</span>
        </div>
      </div>

      {/* Right: Quick actions & user menu */}
      <div className="flex items-center gap-3">
        {/* Quick New Bill Button */}
        <Link
          href="/pos"
          className="flex items-center gap-1.5 bg-gradient-to-r from-brand-500 to-amberGold-600 hover:from-brand-600 hover:to-amberGold-500 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow transition active:scale-95"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span className="hidden sm:inline">New Bill</span>
        </Link>

        {/* Live Active Orders link */}
        <Link
          href="/orders"
          className="relative p-2 text-brand-200 hover:text-white bg-brand-900/60 hover:bg-brand-900 rounded-lg border border-brand-700/50 transition"
          title="Active Orders"
        >
          <ShoppingBag className="w-4 h-4" />
          {activeOrdersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
              {activeOrdersCount}
            </span>
          )}
        </Link>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-brand-900/80 hover:bg-brand-950 border border-brand-700 rounded-lg text-xs transition"
          >
            <div className="w-6 h-6 rounded-full bg-brand-700 text-brand-200 flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden lg:block">
              <p className="font-semibold text-white leading-tight">{currentUser?.name.split(' ')[0]}</p>
              <p className="text-[10px] text-brand-400 uppercase tracking-wider">{currentUser?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-brand-400" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name}</p>
                <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-100 text-brand-800">
                  {currentUser?.role}
                </span>
              </div>

              <div className="py-1">
                <p className="px-3 py-1 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                  Quick Switch Role
                </p>
                <button
                  onClick={() => {
                    loginAs('admin');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 flex items-center justify-between text-gray-700"
                >
                  <span>Admin (Full Access)</span>
                  {currentUser?.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-green-600" />}
                </button>
                <button
                  onClick={() => {
                    loginAs('cashier');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 flex items-center justify-between text-gray-700"
                >
                  <span>Cashier (POS & Orders)</span>
                  {currentUser?.role === 'cashier' && <ShieldCheck className="w-3.5 h-3.5 text-green-600" />}
                </button>
                <button
                  onClick={() => {
                    loginAs('staff');
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 flex items-center justify-between text-gray-700"
                >
                  <span>Staff (Kitchen / Orders)</span>
                  {currentUser?.role === 'staff' && <ShieldCheck className="w-3.5 h-3.5 text-green-600" />}
                </button>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <Link
                  href="/settings"
                  onClick={() => setUserDropdownOpen(false)}
                  className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100"
                >
                  Restaurant Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setUserDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
