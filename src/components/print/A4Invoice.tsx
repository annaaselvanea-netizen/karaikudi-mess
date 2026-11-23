'use client';

import React, { useRef } from 'react';
import { Bill, RestaurantSettings } from '@/types';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import { downloadA4InvoicePdf } from '@/lib/pdf-generator';
import { Printer, Download, X, ChefHat, CheckCircle } from 'lucide-react';

interface A4InvoiceModalProps {
  bill: Bill;
  settings: RestaurantSettings;
  onClose: () => void;
}

export function A4InvoiceModal({ bill, settings, onClose }: A4InvoiceModalProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadA4InvoicePdf(bill, settings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-stone-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#441a0e] text-white">
          <div className="flex items-center gap-2.5">
            <ChefHat className="w-6 h-6 text-amberGold-400" />
            <div>
              <h3 className="font-bold text-base">Standard A4 Tax Invoice</h3>
              <p className="text-xs text-brand-200">Official GST-Compliant Restaurant Invoice</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white text-[#441a0e] hover:bg-stone-100 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print A4</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable A4 Document View */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-200 flex justify-center custom-scrollbar">
          <div
            ref={invoiceRef}
            id="printable-a4-invoice"
            className="bg-white shadow-xl p-8 md:p-10 w-full max-w-3xl text-stone-900 border border-stone-200 select-text"
          >
            {/* Top Brand Banner */}
            <div className="flex justify-between items-start pb-6 border-b-2 border-brand-800">
              <div>
                <h1 className="text-2xl font-black text-[#441a0e] tracking-tight uppercase">
                  {settings.name}
                </h1>
                <p className="text-xs font-semibold text-brand-700 tracking-wide mt-0.5">
                  {settings.tagline}
                </p>
                <div className="text-xs text-stone-600 mt-2 space-y-0.5">
                  <p>{settings.address}</p>
                  <p>
                    <span className="font-medium">Phone:</span> {settings.phone} |{' '}
                    <span className="font-medium">Email:</span> {settings.email}
                  </p>
                  {settings.gstin && (
                    <p>
                      <span className="font-bold text-stone-800">GSTIN:</span> {settings.gstin} |{' '}
                      <span className="font-bold text-stone-800">FSSAI Lic:</span>{' '}
                      {settings.fssaiNumber || '12419008000456'}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-brand-100 text-[#441a0e] font-black text-sm tracking-wider uppercase rounded-md border border-brand-300">
                  TAX INVOICE
                </span>
                <p className="text-xs font-bold text-stone-800 mt-2">
                  Invoice #: <span className="font-mono text-brand-900">{bill.billNumber}</span>
                </p>
                <p className="text-xs text-stone-500">
                  Date: {formatDateOnly(bill.date)} {bill.time}
                </p>
                <p className="text-xs font-bold text-amber-700">Token: #{bill.tokenNumber}</p>
              </div>
            </div>

            {/* Customer & Order Metadata Box */}
            <div className="grid grid-cols-2 gap-4 my-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs">
              <div>
                <p className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                  Billed To / Customer Details:
                </p>
                <p className="font-semibold text-stone-900 text-sm">
                  {bill.customerName || 'Walk-in Guest'}
                </p>
                <p className="text-stone-600 mt-0.5">
                  Phone: {bill.customerPhone ? bill.customerPhone : 'N/A'}
                </p>
              </div>

              <div>
                <p className="font-bold text-stone-800 uppercase tracking-wider text-[11px] mb-1">
                  Order Details:
                </p>
                <p className="text-stone-700">
                  <span className="font-medium">Order Number:</span> {bill.orderNumber}
                </p>
                <p className="text-stone-700">
                  <span className="font-medium">Order Type:</span>{' '}
                  <span className="font-semibold uppercase">{bill.orderType}</span>{' '}
                  {bill.tableNumber && `(Table ${bill.tableNumber})`}
                </p>
                <p className="text-stone-700">
                  <span className="font-medium">Billed By:</span> {bill.cashierName}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-xs text-left mb-6 border border-stone-200">
              <thead className="bg-[#441a0e] text-white uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {bill.items.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/70'}>
                    <td className="py-2 px-3 text-center text-stone-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-semibold text-stone-900">
                      {item.name}
                      {item.tamilName && (
                        <span className="text-[10px] text-stone-500 font-normal block font-tamil">
                          {item.tamilName}
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-stone-600">{item.category}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(item.price)}</td>
                    <td className="py-2 px-3 text-center font-bold">{item.quantity}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-stone-900">
                      {formatCurrency(item.price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations Breakdown */}
            <div className="flex justify-end mb-8">
              <div className="w-64 space-y-2 text-xs">
                <div className="flex justify-between text-stone-700">
                  <span>Subtotal:</span>
                  <span className="font-mono font-medium">{formatCurrency(bill.subtotal)}</span>
                </div>

                {bill.discount > 0 && (
                  <div className="flex justify-between text-red-600 font-medium">
                    <span>Discount:</span>
                    <span className="font-mono">-{formatCurrency(bill.discount)}</span>
                  </div>
                )}

                {bill.taxAmount > 0 && (
                  <>
                    <div className="flex justify-between text-stone-600">
                      <span>CGST ({(bill.taxRate / 2).toFixed(1)}%):</span>
                      <span className="font-mono">{formatCurrency(bill.taxAmount / 2)}</span>
                    </div>
                    <div className="flex justify-between text-stone-600">
                      <span>SGST ({(bill.taxRate / 2).toFixed(1)}%):</span>
                      <span className="font-mono">{formatCurrency(bill.taxAmount / 2)}</span>
                    </div>
                  </>
                )}

                <div className="pt-2 border-t-2 border-stone-800 flex justify-between font-black text-sm text-[#441a0e]">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base">{formatCurrency(bill.finalAmount)}</span>
                </div>

                <div className="pt-1 text-[11px] text-stone-600 flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold uppercase text-stone-900">{bill.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Footer with Terms and Signature */}
            <div className="pt-8 border-t border-stone-200 grid grid-cols-2 gap-4 items-end text-[11px] text-stone-500">
              <div>
                <p className="font-bold text-stone-800 uppercase tracking-wider mb-1">
                  Terms & Conditions:
                </p>
                <p>1. Goods and food once served/sold cannot be exchanged or refunded.</p>
                <p>2. This is an authentic computer generated Tax Invoice.</p>
                <p className="mt-1 font-semibold text-brand-800 font-tamil">
                  {settings.receiptFooterMessage}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-stone-900 mb-10">For {settings.name.toUpperCase()}</p>
                <div className="border-t border-stone-400 inline-block pt-1 px-4 text-center">
                  <p className="font-semibold text-stone-700">Authorized Signatory</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
