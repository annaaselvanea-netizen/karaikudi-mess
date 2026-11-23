'use client';

import React, { useRef } from 'react';
import { Bill, RestaurantSettings } from '@/types';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import { downloadEscPosFile } from '@/lib/printer';
import { Printer, Download, X, FileText, CheckCircle } from 'lucide-react';

interface ThermalReceiptModalProps {
  bill: Bill;
  settings: RestaurantSettings;
  onClose: () => void;
  onOpenA4?: () => void;
}

export function ThermalReceiptModal({
  bill,
  settings,
  onClose,
  onOpenA4,
}: ThermalReceiptModalProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const is58mm = settings.thermalPaperSize === '58mm';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadEscPos = () => {
    downloadEscPosFile(bill, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-amber-200">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#441a0e] text-white">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-sm leading-tight">Thermal Receipt Preview</h3>
              <p className="text-[11px] text-amber-200 font-mono">
                {settings.thermalPaperSize} Roll • ESC/POS Ready
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-amber-50/70 border-b border-amber-100 text-xs">
          <div className="flex items-center gap-1.5 text-stone-600 font-medium">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Bill #{bill.billNumber} Saved</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenA4 && (
              <button
                onClick={onOpenA4}
                className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-medium flex items-center gap-1 transition"
                title="Switch to A4 Invoice"
              >
                <FileText className="w-3.5 h-3.5 text-brand-700" />
                <span>A4 Invoice</span>
              </button>
            )}
            <button
              onClick={handleDownloadEscPos}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium flex items-center gap-1 transition"
              title="Download raw ESC/POS binary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ESC/POS (.bin)</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 hover:to-amberGold-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>

        {/* Scrollable Receipt Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-100 flex justify-center custom-scrollbar">
          {/* Paper container */}
          <div
            ref={receiptRef}
            id="printable-thermal-receipt"
            className={`bg-white shadow-md p-4 text-black font-mono text-[11px] leading-relaxed select-text border border-dashed border-stone-300 ${
              is58mm ? 'w-[58mm] max-w-[240px]' : 'w-[80mm] max-w-[320px]'
            }`}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-black">
              <img
                src={settings.logoUrl || '/logo.jpg'}
                alt="Karaikudi Mess"
                className="w-20 mx-auto mb-1.5 object-contain filter grayscale contrast-125"
              />
              <h2 className="text-sm font-black uppercase tracking-wider">{settings.name}</h2>
              <p className="text-[10px] font-semibold">{settings.tagline}</p>
              <p className="text-[9px] mt-0.5">{settings.address}</p>
              <p className="text-[9px]">Ph: {settings.phone}</p>
              {settings.gstin && <p className="text-[9px]">GSTIN: {settings.gstin}</p>}
              {settings.fssaiNumber && <p className="text-[9px]">FSSAI: {settings.fssaiNumber}</p>}
            </div>

            {/* Bill Meta */}
            <div className="py-2 border-b border-dashed border-black text-[10px]">
              <div className="flex justify-between font-bold">
                <span>Bill: {bill.billNumber}</span>
                <span>Token: #{bill.tokenNumber}</span>
              </div>
              <div className="flex justify-between text-[9px] text-stone-700">
                <span>Date: {formatDateOnly(bill.date)}</span>
                <span>Time: {bill.time}</span>
              </div>
              <div className="flex justify-between text-[9px]">
                <span>Type: {bill.orderType.toUpperCase()}</span>
                {bill.tableNumber && <span>Table: {bill.tableNumber}</span>}
              </div>
              {bill.customerName && (
                <div className="text-[9px]">Cust: {bill.customerName}</div>
              )}
            </div>

            {/* Items Table */}
            <div className="py-2 border-b border-black">
              <div className="flex justify-between font-bold text-[10px] border-b border-dashed border-stone-400 pb-1 mb-1">
                <span className="w-6/12 text-left">ITEM</span>
                <span className="w-2/12 text-center">QTY</span>
                <span className="w-4/12 text-right">AMT</span>
              </div>

              {bill.items.map((item, idx) => {
                const total = (item.price * item.quantity).toFixed(2);
                return (
                  <div key={idx} className="flex justify-between py-0.5 text-[10px]">
                    <div className="w-6/12 text-left truncate">{item.name}</div>
                    <div className="w-2/12 text-center">{item.quantity}</div>
                    <div className="w-4/12 text-right">₹{total}</div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="py-2 border-b border-dashed border-black text-[10px] space-y-0.5">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{bill.subtotal.toFixed(2)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Discount:</span>
                  <span>-₹{bill.discount.toFixed(2)}</span>
                </div>
              )}
              {bill.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span>GST ({bill.taxRate}%):</span>
                  <span>₹{bill.taxAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Grand Total */}
            <div className="py-2 border-b-2 border-black flex justify-between font-black text-xs">
              <span>TOTAL:</span>
              <span>₹{bill.finalAmount.toFixed(2)}</span>
            </div>

            {/* Payment Details */}
            <div className="py-1.5 border-b border-dashed border-black text-[9px]">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="font-bold">{bill.paymentMethod.toUpperCase()}</span>
              </div>
              {bill.amountReceived > 0 && (
                <div className="flex justify-between">
                  <span>Received:</span>
                  <span>₹{bill.amountReceived.toFixed(2)}</span>
                </div>
              )}
              {bill.balanceAmount > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Change Due:</span>
                  <span>₹{bill.balanceAmount.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Footer Message */}
            <div className="text-center pt-3 text-[9px]">
              <p className="font-bold">{settings.receiptFooterMessage}</p>
              <p className="text-[8px] text-stone-500 mt-1">Karaikudi Mess Billing POS</p>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="px-4 py-2 bg-stone-50 border-t border-stone-200 text-center text-[11px] text-stone-500">
          ESC/POS compatible with 58mm/80mm Bluetooth, USB & Serial Thermal Printers.
        </div>
      </div>
    </div>
  );
}
