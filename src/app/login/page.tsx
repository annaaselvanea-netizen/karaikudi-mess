'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import { ChefHat, ShieldCheck, UserCheck, Utensils, LogIn, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAs, loginWithEmail, currentUser } = useAuth();
  const [emailInput, setEmailInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleRoleLogin = (role: UserRole) => {
    loginAs(role);
    router.push(role === 'cashier' ? '/pos' : role === 'staff' ? '/orders' : '/');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const ok = loginWithEmail(emailInput.trim());
    if (ok) {
      router.push('/');
    } else {
      setErrorMsg('Invalid email credentials or unauthorized account');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-br from-[#441a0e] to-amberGold-600 p-8 text-white text-center">
          <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
            <ChefHat className="w-8 h-8 text-amber-300" />
          </div>
          <h2 className="text-2xl font-black tracking-tight font-serif">Karaikudi Mess</h2>
          <p className="text-xs text-brand-200 mt-1">Hotel Billing & Restaurant Management POS</p>
        </div>

        {/* Form & Roles */}
        <div className="p-6 space-y-6">
          <div>
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-3 text-center">
              Choose Quick Role Access
            </span>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={() => handleRoleLogin('admin')}
                className="p-3 rounded-2xl border-2 border-stone-200 hover:border-brand-600 hover:bg-brand-50/50 flex flex-col items-center gap-1.5 transition text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-brand-700" />
                </div>
                <span className="text-xs font-bold text-stone-900 block">Admin</span>
                <span className="text-[10px] text-stone-500">Full Access</span>
              </button>

              <button
                onClick={() => handleRoleLogin('cashier')}
                className="p-3 rounded-2xl border-2 border-stone-200 hover:border-brand-600 hover:bg-brand-50/50 flex flex-col items-center gap-1.5 transition text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Utensils className="w-5 h-5 text-amber-700" />
                </div>
                <span className="text-xs font-bold text-stone-900 block">Cashier</span>
                <span className="text-[10px] text-stone-500">POS Billing</span>
              </button>

              <button
                onClick={() => handleRoleLogin('staff')}
                className="p-3 rounded-2xl border-2 border-stone-200 hover:border-brand-600 hover:bg-brand-50/50 flex flex-col items-center gap-1.5 transition text-center group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="w-5 h-5 text-blue-700" />
                </div>
                <span className="text-xs font-bold text-stone-900 block">Staff</span>
                <span className="text-[10px] text-stone-500">Kitchen KDS</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400 font-bold">Or Email Login</span>
            </div>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {errorMsg}
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-stone-700 block mb-1">Staff Email</label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="admin@karaikudimess.in"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#441a0e] hover:bg-brand-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Email</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
