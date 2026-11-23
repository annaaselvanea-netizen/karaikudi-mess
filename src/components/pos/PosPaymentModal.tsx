'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { PaymentMethod } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  X,
  Banknote,
  QrCode,
  CreditCard,
  Split,
  CheckCircle2,
  AlertCircle,
  Printer,
  Sparkles,
} from 'lucide-react';

interface PosPaymentModalProps {
  totalAmount: number;
  onClose: () => void;
}

export function PosPaymentModal({ totalAmount, onClose }: PosPaymentModalProps) {
  const { completePaymentAndBill, settings } = useRestaurant();

  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [amountReceived, setAmountReceived] = useState<number>(totalAmount);
  const [cashAmount, setCashAmount] = useState<number>(Math.floor(totalAmount / 2));
  const [upiAmount, setUpiAmount] = useState<number>(Math.ceil(totalAmount / 2));
  const [cardAmount, setCardAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Quick cash note buttons
  const cashPresets = [
    totalAmount,
    Math.ceil(totalAmount / 50) * 50,
    Math.ceil(totalAmount / 100) * 100,
    Math.ceil(totalAmount / 500) * 500,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v >= totalAmount);

  const balanceDue = Math.max(0, amountReceived - totalAmount);

  const handleCompleteBill = async () => {
    try {
      setIsProcessing(true);
      let splitDetails = undefined;
      if (method === 'split') {
        splitDetails = { cashAmount, upiAmount, cardAmount };
      }

      await completePaymentAndBill(method, amountReceived, splitDetails);
      setIsProcessing(false);
      onClose();
    } catch (err) {
      console.error('Bill completion failed:', err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-amber-200">
        {/* Modal Top Banner */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#441a0e] text-white">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amberGold-400" />
            <div>
              <h3 className="font-bold text-base">Payment & Billing Settlement</h3>
              <p className="text-xs text-brand-200">Select payment method & tender cash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Total Payable Banner */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Total Payable Amount
              </span>
              <p className="text-2xl font-black text-[#441a0e] font-mono">
                {formatCurrency(totalAmount)}
              </p>
            </div>
            <div className="text-right text-xs text-stone-500">
              <span className="font-semibold text-stone-700">{settings.name}</span>
              <p>Automatic Invoice Generation</p>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('cash');
                  setAmountReceived(totalAmount);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  method === 'cash'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Banknote className="w-5 h-5 text-emerald-600" />
                <span className="text-xs">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('upi');
                  setAmountReceived(totalAmount);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  method === 'upi'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <QrCode className="w-5 h-5 text-blue-600" />
                <span className="text-xs">UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('card');
                  setAmountReceived(totalAmount);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  method === 'card'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span className="text-xs">Card / POS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('split');
                  setAmountReceived(totalAmount);
                }}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  method === 'split'
                    ? 'border-brand-600 bg-brand-50 text-brand-900 font-bold shadow-sm'
                    : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                }`}
              >
                <Split className="w-5 h-5 text-amber-600" />
                <span className="text-xs">Split Pay</span>
              </button>
            </div>
          </div>

          {/* Conditional Method Controls */}
          {method === 'cash' && (
            <div className="space-y-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Amount Received from Customer (₹)
                </label>
                <input
                  type="number"
                  value={amountReceived}
                  onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-lg font-mono font-bold bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Quick Cash Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-stone-500 font-medium">Quick Notes:</span>
                {cashPresets.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountReceived(preset)}
                    className="px-2.5 py-1 bg-white hover:bg-brand-100 border border-stone-300 rounded-md text-xs font-mono font-semibold text-stone-800 transition"
                  >
                    ₹{preset}
                  </button>
                ))}
              </div>

              {/* Balance / Change Due */}
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                <span className="text-xs font-bold text-stone-700">Change Due to Customer:</span>
                <span className="text-base font-black font-mono text-emerald-700">
                  {formatCurrency(balanceDue)}
                </span>
              </div>
            </div>
          )}

          {method === 'upi' && (
            <div className="p-4 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center gap-4">
              <div className="w-24 h-24 bg-white p-2 rounded-lg border border-blue-300 flex flex-col items-center justify-center shrink-0 shadow-sm">
                <QrCode className="w-16 h-16 text-blue-900" />
                <span className="text-[8px] font-bold text-blue-800 mt-1 uppercase">Scan & Pay</span>
              </div>
              <div className="text-xs text-blue-950 space-y-1">
                <p className="font-bold text-sm">GPay / PhonePe / Paytm / BHIM</p>
                <p className="text-[11px] text-blue-800">
                  UPI ID: <span className="font-mono font-bold">karaikudimess@icici</span>
                </p>
                <p className="text-[11px] text-blue-700">
                  Amount: <span className="font-mono font-bold">{formatCurrency(totalAmount)}</span>
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-200/80 text-blue-900 text-[10px] font-semibold">
                  Awaiting Customer Payment
                </span>
              </div>
            </div>
          )}

          {method === 'split' && (
            <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2 text-xs">
              <p className="font-bold text-stone-800">Split Payment Breakdown</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-stone-600 block mb-0.5">Cash Amount (₹)</label>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 font-mono bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-stone-600 block mb-0.5">UPI Amount (₹)</label>
                  <input
                    type="number"
                    value={upiAmount}
                    onChange={(e) => setUpiAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 font-mono bg-white border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div className="text-[11px] flex justify-between font-bold pt-1 text-stone-700">
                <span>Split Sum: {formatCurrency(cashAmount + upiAmount + cardAmount)}</span>
                <span>Required: {formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-stone-100 border-t border-stone-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
          >
            Cancel
          </button>

          <button
            onClick={handleCompleteBill}
            disabled={isProcessing || (method === 'cash' && amountReceived < totalAmount)}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition active:scale-95 ${
              isProcessing || (method === 'cash' && amountReceived < totalAmount)
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 hover:to-amberGold-700 text-white'
            }`}
          >
            {isProcessing ? (
              <span>Saving & Generating Bill...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Print Bill</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
