'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ClipboardList,
  BookOpen,
  Receipt,
  BarChart3,
  FileSpreadsheet,
  Settings,
  X,
  ChefHat,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentUser, isAdmin, isCashier, isStaff, logout } = useAuth();

  const navigation = [
    {
      name: 'Main Dashboard',
      tamilName: 'முகப்பு பலகை',
      href: '/',
      icon: LayoutDashboard,
      allowed: true,
    },
    {
      name: 'POS Billing',
      tamilName: 'பில்லிங் கவுண்டர்',
      href: '/pos',
      icon: UtensilsCrossed,
      allowed: isCashier,
    },
    {
      name: 'Order Management',
      tamilName: 'ஆர்டர் மேலாண்மை',
      href: '/orders',
      icon: ClipboardList,
      allowed: true,
    },
    {
      name: 'Food Menu',
      tamilName: 'மெனு நிர்வாகம்',
      href: '/menu',
      icon: BookOpen,
      allowed: isAdmin,
    },
    {
      name: 'Expense Management',
      tamilName: 'செலவு கணக்கு',
      href: '/expenses',
      icon: Receipt,
      allowed: isAdmin,
    },
    {
      name: 'Reports & Analytics',
      tamilName: 'விற்பனை அறிக்கைகள்',
      href: '/reports',
      icon: BarChart3,
      allowed: isAdmin,
    },
    {
      name: 'Google Sheets Sync',
      tamilName: 'கூகுள் தாள்கள் இணைப்பு',
      href: '/sheets',
      icon: FileSpreadsheet,
      allowed: isAdmin,
    },
    {
      name: 'Restaurant Settings',
      tamilName: 'அமைப்புகள்',
      href: '/settings',
      icon: Settings,
      allowed: isAdmin,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#270d07] text-stone-200 border-r border-[#441a0e] flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-[#441a0e] bg-[#1a0804]">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-amberGold-500 flex items-center justify-center text-white shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide text-white font-serif">
                KARAIKUDI
              </span>
              <span className="text-amberGold-500 font-bold text-xs ml-1">MESS</span>
            </div>
          </Link>

          <button
            onClick={onMobileClose}
            className="p-1 rounded-md text-stone-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-bold text-brand-400 uppercase tracking-wider">
            Restaurant Operations
          </div>

          {navigation.map((item) => {
            if (!item.allowed) return null;
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-md font-semibold translate-x-1'
                    : 'text-stone-300 hover:bg-[#38140a] hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-amberGold-300' : 'text-brand-400'
                  }`}
                />
                <div className="flex flex-col">
                  <span className="leading-tight">{item.name}</span>
                  <span className="text-[10px] text-stone-400 font-tamil leading-none mt-0.5 opacity-80">
                    {item.tamilName}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom User status footer */}
        <div className="p-4 border-t border-[#441a0e] bg-[#1d0905]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-800 text-amberGold-300 flex items-center justify-center font-bold text-xs border border-brand-600">
                {currentUser?.name.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate w-32">{currentUser?.name}</p>
                <p className="text-[10px] text-amberGold-400 uppercase font-semibold">
                  {currentUser?.role} Role
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-stone-400 hover:text-red-400 hover:bg-brand-950 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center">
            <p className="text-[10px] text-stone-400 font-mono">Karaikudi Mess POS v1.0.0</p>
            <p className="text-[9px] text-stone-400">Chettinad Speciality POS System</p>
          </div>
        </div>
      </aside>
    </>
  );
}
