'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useRestaurant } from '@/context/RestaurantContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ThermalReceiptModal } from '@/components/print/ThermalReceipt';
import { A4InvoiceModal } from '@/components/print/A4Invoice';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toasts, removeToast, activePrintedBill, setActivePrintedBill, settings } = useRestaurant();
  const [showA4Modal, setShowA4Modal] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#fbf6e8]/40 text-stone-900 font-sans antialiased">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMobileMenuToggle={() => setMobileMenuOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Floating Active Thermal Receipt Modal (Triggered right after billing) */}
      {activePrintedBill && (
        <ThermalReceiptModal
          bill={activePrintedBill}
          settings={settings}
          onClose={() => setActivePrintedBill(null)}
          onOpenA4={() => {
            setShowA4Modal(true);
          }}
        />
      )}

      {/* A4 Invoice Modal */}
      {showA4Modal && activePrintedBill && (
        <A4InvoiceModal
          bill={activePrintedBill}
          settings={settings}
          onClose={() => setShowA4Modal(false)}
        />
      )}

      {/* Global Toast Notification Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-xl border text-xs font-medium transition-all transform animate-in slide-in-from-bottom-2 ${
              toast.type === 'error'
                ? 'bg-red-900 text-red-50 border-red-700'
                : toast.type === 'info'
                ? 'bg-stone-900 text-stone-50 border-stone-700'
                : 'bg-emerald-900 text-emerald-50 border-emerald-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              ) : toast.type === 'info' ? (
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              )}
              <span>{toast.text}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-300 hover:text-white p-1 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
