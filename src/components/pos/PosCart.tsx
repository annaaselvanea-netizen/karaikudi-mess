'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatDateOnly } from '@/lib/utils';
import { OrderType, PaymentMethod, Bill } from '@/types';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  User,
  Phone,
  Utensils,
  Package,
  Percent,
  Printer,
  CheckCircle2,
  RotateCcw,
  Banknote,
  QrCode,
} from 'lucide-react';

export function PosCart() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateItemInstruction,
    clearCart,
    cartSubtotal,
    cartDiscount,
    setCartDiscount,
    cartTax,
    cartTotal,
    cartTotalQuantity,
    orderType,
    setOrderType,
    tableNumber,
    setTableNumber,
    customerName,
    setCustomerName,
    customerPhone,
    setCustomerPhone,
    settings,
    completePaymentAndBill,
  } = useRestaurant();

  const { language, t } = useLanguage();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [amountReceivedInput, setAmountReceivedInput] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>('');
  const [editingInstructionId, setEditingInstructionId] = useState<string | null>(null);
  const [instructionText, setInstructionText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastSettledBill, setLastSettledBill] = useState<Bill | null>(null);

  // Parse amount received
  const parsedReceived = parseFloat(amountReceivedInput) || 0;
  // If no amount entered yet, default balance calculation to 0 or based on tender
  const amountTendered = amountReceivedInput ? parsedReceived : cartTotal;
  const balanceDue = Math.max(0, amountTendered - cartTotal);

  // Quick cash preset note helpers
  const quickPresets = [
    { label: t('pos.exact'), val: cartTotal },
    { label: `₹${Math.ceil(cartTotal / 50) * 50 || 50}`, val: Math.ceil(cartTotal / 50) * 50 || 50 },
    { label: `₹${Math.ceil(cartTotal / 100) * 100 || 100}`, val: Math.ceil(cartTotal / 100) * 100 || 100 },
    { label: `₹${Math.ceil(cartTotal / 500) * 500 || 500}`, val: Math.ceil(cartTotal / 500) * 500 || 500 },
  ].filter((p, i, arr) => p.val >= cartTotal && arr.findIndex((x) => x.val === p.val) === i);

  const handleApplyDiscount = () => {
    const val = parseFloat(discountInput) || 0;
    if (val >= 0 && val <= cartSubtotal) {
      setCartDiscount(val);
    } else {
      setCartDiscount(0);
      setDiscountInput('');
    }
  };

  const handleSaveInstruction = (id: string) => {
    updateItemInstruction(id, instructionText);
    setEditingInstructionId(null);
    setInstructionText('');
  };

  // Direct Inline Settle & Print Bill without navigating away
  const handlePrintAndSettleBill = async () => {
    if (cart.length === 0) return;

    try {
      setIsProcessing(true);
      const tender = amountReceivedInput ? parsedReceived : cartTotal;

      // completePaymentAndBill with shouldOpenModal=false so it does NOT pop up a redirect/overlay modal
      const bill = await completePaymentAndBill(paymentMethod, tender, undefined, false);
      setLastSettledBill(bill);
      setIsProcessing(false);

      // Trigger thermal print directly in the browser
      setTimeout(() => {
        window.print();
      }, 150);
    } catch (err) {
      console.error('POS billing error:', err);
      setIsProcessing(false);
    }
  };

  const handleStartNextOrder = () => {
    setLastSettledBill(null);
    setAmountReceivedInput('');
    clearCart();
  };

  return (
    <>
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col h-full overflow-hidden shrink-0">
        {/* Header: Order Type (Dine-in / Takeaway / Parcel) */}
        <div className="p-3.5 bg-[#441a0e] text-white shrink-0">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/25 rounded-xl text-xs font-semibold">
            <button
              onClick={() => {
                setOrderType('dine-in');
                if (lastSettledBill) handleStartNextOrder();
              }}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
                orderType === 'dine-in' ? 'bg-amberGold-500 text-stone-950 font-bold shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>{t('pos.dineIn')}</span>
            </button>
            <button
              onClick={() => {
                setOrderType('takeaway');
                if (lastSettledBill) handleStartNextOrder();
              }}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
                orderType === 'takeaway' ? 'bg-amberGold-500 text-stone-950 font-bold shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('pos.takeaway')}</span>
            </button>
            <button
              onClick={() => {
                setOrderType('parcel');
                if (lastSettledBill) handleStartNextOrder();
              }}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
                orderType === 'parcel' ? 'bg-amberGold-500 text-stone-950 font-bold shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{t('pos.parcel')}</span>
            </button>
          </div>

          {/* Table Number & Customer Mobile Row */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
            {orderType === 'dine-in' ? (
              <div>
                <label className="text-[10px] text-amber-200 font-medium">{t('pos.tableNo')}</label>
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full mt-0.5 bg-[#2d1109] border border-brand-700 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amberGold-400"
                >
                  {Array.from({ length: 24 }, (_, i) => `T${i + 1}`).map((tbl) => (
                    <option key={tbl} value={tbl}>
                      Table {tbl}
                    </option>
                  ))}
                  <option value="Family Room 1">Family Room 1</option>
                  <option value="Family Room 2">Family Room 2</option>
                  <option value="AC Hall 1">AC Hall 1</option>
                  <option value="AC Hall 2">AC Hall 2</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="text-[10px] text-amber-200 font-medium">Token Type</label>
                <div className="mt-0.5 px-2 py-1.5 bg-[#2d1109] border border-brand-700 text-amber-300 rounded-lg font-bold text-xs uppercase">
                  {orderType} COUNTER
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-amber-200 font-medium">{t('pos.customerPhone')}</label>
              <div className="relative mt-0.5">
                <Phone className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-brand-400" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full pl-6 pr-2 py-1.5 bg-[#2d1109] border border-brand-700 text-white rounded-lg text-xs placeholder-brand-500/70 focus:outline-none focus:ring-1 focus:ring-amberGold-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Either Last Settled Bill Card OR Cart Items List */}
        {lastSettledBill ? (
          <div className="flex-1 overflow-y-auto p-4 bg-emerald-50/50 flex flex-col justify-between custom-scrollbar">
            <div className="bg-white p-4 rounded-2xl border-2 border-emerald-500 shadow-md space-y-3">
              <div className="flex items-center gap-2 text-emerald-800">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-950 leading-tight">
                    {t('pos.billSettled')}
                  </h4>
                  <p className="text-xs font-mono font-bold text-emerald-800">
                    Bill #{lastSettledBill.billNumber} • Token #{lastSettledBill.tokenNumber}
                  </p>
                </div>
              </div>

              {/* Items Summary */}
              <div className="py-2 border-y border-dashed border-stone-200 text-xs space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                {lastSettledBill.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-stone-700">
                    <span className="truncate">
                      {it.quantity}x {language === 'ta' && it.tamilName ? it.tamilName : it.name}
                    </span>
                    <span className="font-mono font-semibold">{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Financial Summary */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>{t('pos.totalAmount')}:</span>
                  <span className="font-mono font-bold text-stone-900">{formatCurrency(lastSettledBill.finalAmount)}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>{t('pos.amountReceived')}:</span>
                  <span className="font-mono font-bold text-stone-900">{formatCurrency(lastSettledBill.amountReceived)}</span>
                </div>
              </div>

              {/* HIGHLIGHTED BALANCE DUE TO RETURN TO GUEST */}
              <div className="p-3 rounded-xl bg-emerald-600 text-white flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">
                    {t('pos.changeToReturn')}
                  </span>
                  <span className="text-[10px] opacity-75 font-tamil">மீதி சில்லறை</span>
                </div>
                <span className="text-2xl font-black font-mono">
                  {formatCurrency(lastSettledBill.balanceAmount)}
                </span>
              </div>
            </div>

            {/* Action Buttons for Settled Bill */}
            <div className="mt-4 space-y-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-stone-300 transition"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                <span>{t('pos.reprint')} Receipt</span>
              </button>

              <button
                onClick={handleStartNextOrder}
                className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 text-white rounded-xl text-sm font-extrabold flex items-center justify-center gap-2 shadow-md transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t('pos.nextOrder')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Cart Items List */
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-stone-50/70 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center p-6">
                <ShoppingBag className="w-12 h-12 text-stone-300 mb-2" />
                <p className="text-sm font-bold text-stone-600">{t('pos.cartEmpty')}</p>
                <p className="text-xs text-stone-400 mt-1 max-w-[220px]">
                  {t('pos.cartEmptySub')}
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs hover:border-brand-300 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            item.foodType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                        <span className="font-bold text-xs text-stone-900 truncate">
                          {language === 'ta' && item.tamilName ? item.tamilName : item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500 font-mono">
                        <span>{formatCurrency(item.price)} each</span>
                        {item.specialInstructions && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-1 rounded truncate">
                            &quot;{item.specialInstructions}&quot;
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-5 h-5 rounded bg-white text-stone-700 hover:bg-stone-200 flex items-center justify-center shadow-2xs"
                      >
                        <Minus className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-xs font-bold font-mono px-1.5">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-5 h-5 rounded bg-[#441a0e] text-white hover:bg-brand-900 flex items-center justify-center shadow-2xs"
                      >
                        <Plus className="w-2.5 h-2.5" />
                      </button>
                    </div>

                    <span className="font-mono font-bold text-xs text-stone-900 w-14 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Special Instruction Note */}
                  <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-stone-100 text-[10px]">
                    <button
                      onClick={() => {
                        setEditingInstructionId(
                          editingInstructionId === item.menuItemId ? null : item.menuItemId
                        );
                        setInstructionText(item.specialInstructions || '');
                      }}
                      className="text-stone-500 hover:text-brand-700 flex items-center gap-1 font-medium"
                    >
                      <MessageSquare className="w-3 h-3 text-stone-400" />
                      <span>{item.specialInstructions ? 'Edit Note' : '+ Note'}</span>
                    </button>

                    <button
                      onClick={() => removeFromCart(item.menuItemId)}
                      className="text-stone-400 hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {editingInstructionId === item.menuItemId && (
                    <div className="mt-2 flex gap-1">
                      <input
                        type="text"
                        value={instructionText}
                        onChange={(e) => setInstructionText(e.target.value)}
                        placeholder="e.g. Less spicy / Extra gravy"
                        className="flex-1 px-2 py-1 text-xs border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <button
                        onClick={() => handleSaveInstruction(item.menuItemId)}
                        className="px-2 py-1 bg-brand-600 text-white rounded-md text-[10px] font-bold"
                      >
                        Save
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Bottom Section: Payment Tender, Balance Due & Direct Print (Active when not showing last settled bill) */}
        {!lastSettledBill && (
          <div className="p-3 bg-white border-t border-stone-200 space-y-2.5 shrink-0">
            {/* Discount & Totals Row */}
            <div className="space-y-1 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>{t('pos.subtotal')} ({cartTotalQuantity} items):</span>
                <span className="font-mono font-medium">{formatCurrency(cartSubtotal)}</span>
              </div>
              {cartDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>{t('pos.discount')}:</span>
                  <span className="font-mono font-medium">-{formatCurrency(cartDiscount)}</span>
                </div>
              )}
              {cartTax > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>{t('pos.tax')} ({settings?.taxRate}%):</span>
                  <span className="font-mono font-medium">{formatCurrency(cartTax)}</span>
                </div>
              )}
            </div>

            {/* Total Amount Box */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-200">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  {t('pos.totalAmount')}
                </span>
                <p className="text-xl font-black text-[#441a0e] font-mono leading-none">
                  {formatCurrency(cartTotal)}
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-stone-400 hover:text-red-600 underline"
                >
                  {t('pos.clearCart')}
                </button>
              )}
            </div>

            {/* Payment Mode Selector Tabs */}
            <div>
              <div className="grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`py-1 rounded-lg flex items-center justify-center gap-1 transition ${
                    paymentMethod === 'cash' ? 'bg-white shadow text-emerald-800 font-bold' : 'text-stone-600'
                  }`}
                >
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('pos.cash')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`py-1 rounded-lg flex items-center justify-center gap-1 transition ${
                    paymentMethod === 'upi' ? 'bg-white shadow text-blue-800 font-bold' : 'text-stone-600'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('pos.upi')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`py-1 rounded-lg flex items-center justify-center gap-1 transition ${
                    paymentMethod === 'card' ? 'bg-white shadow text-purple-800 font-bold' : 'text-stone-600'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                  <span>{t('pos.card')}</span>
                </button>
              </div>
            </div>

            {/* Direct Cash Tender & Balance Due Box */}
            {paymentMethod === 'cash' && cart.length > 0 && (
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-stone-700 whitespace-nowrap">
                    {t('pos.amountReceived')}:
                  </label>
                  <input
                    type="number"
                    value={amountReceivedInput}
                    onChange={(e) => setAmountReceivedInput(e.target.value)}
                    placeholder={String(cartTotal)}
                    className="w-28 px-2 py-1 text-sm font-mono font-bold text-right bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Quick Currency Tender Presets */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                  {quickPresets.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAmountReceivedInput(String(qp.val))}
                      className="px-2 py-0.5 rounded bg-white hover:bg-emerald-50 border border-stone-300 text-[10px] font-mono font-bold text-stone-700 transition shrink-0"
                    >
                      {qp.label}
                    </button>
                  ))}
                </div>

                {/* HIGHLIGHTED BALANCE DUE (மீதி தொகை) */}
                <div className="pt-1.5 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-extrabold text-stone-700 block leading-tight">
                      {t('pos.balanceDue')}:
                    </span>
                    <span className="text-[10px] text-stone-500 font-tamil leading-none">
                      மீதி சில்லறை
                    </span>
                  </div>
                  <span className="text-lg font-black font-mono text-emerald-700">
                    {formatCurrency(balanceDue)}
                  </span>
                </div>
              </div>
            )}

            {/* DIRECT PRINT & SETTLE BUTTON (Never redirects to another page!) */}
            <button
              onClick={handlePrintAndSettleBill}
              disabled={cart.length === 0 || isProcessing || (paymentMethod === 'cash' && amountReceivedInput !== '' && parsedReceived < cartTotal)}
              className={`w-full py-3 px-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-md transition active:scale-98 ${
                cart.length === 0 || isProcessing || (paymentMethod === 'cash' && amountReceivedInput !== '' && parsedReceived < cartTotal)
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-700 via-brand-700 to-amberGold-600 hover:from-emerald-800 text-white'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>
                {isProcessing
                  ? 'Processing...'
                  : `${t('pos.printAndSettle')} (${formatCurrency(cartTotal)})`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Hidden Printable Thermal Receipt Template on POS page - populated with either latest settled bill or active cart */}
      <div className="hidden">
        <div
          id="printable-thermal-receipt"
          className="bg-white p-3 font-mono text-[11px] leading-tight text-black"
        >
          {lastSettledBill ? (
            <div>
              <div className="text-center pb-2 border-b border-black">
                <h2 className="text-sm font-black uppercase">{settings.name}</h2>
                <p className="text-[10px]">{settings.tagline}</p>
                <p className="text-[9px]">{settings.address}</p>
                <p className="text-[9px]">Ph: {settings.phone}</p>
                {settings.gstin && <p className="text-[9px]">GSTIN: {settings.gstin}</p>}
              </div>

              <div className="py-2 border-b border-dashed border-black text-[10px]">
                <div className="flex justify-between font-bold">
                  <span>Bill: {lastSettledBill.billNumber}</span>
                  <span>Token: #{lastSettledBill.tokenNumber}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Date: {lastSettledBill.date}</span>
                  <span>Time: {lastSettledBill.time}</span>
                </div>
                <div className="flex justify-between text-[9px]">
                  <span>Type: {lastSettledBill.orderType.toUpperCase()}</span>
                  {lastSettledBill.tableNumber && <span>Table: {lastSettledBill.tableNumber}</span>}
                </div>
              </div>

              <div className="py-2 border-b border-black">
                <div className="flex justify-between font-bold text-[10px] border-b pb-1 mb-1">
                  <span>ITEM</span>
                  <span>QTY</span>
                  <span>AMT</span>
                </div>
                {lastSettledBill.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-[10px] py-0.5">
                    <span className="w-6/12 truncate">{it.name}</span>
                    <span className="w-2/12 text-center">{it.quantity}</span>
                    <span className="w-4/12 text-right">₹{(it.price * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="py-1.5 border-b border-dashed border-black text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{lastSettledBill.subtotal.toFixed(2)}</span>
                </div>
                {lastSettledBill.discount > 0 && (
                  <div className="flex justify-between text-red-600 font-semibold">
                    <span>Discount:</span>
                    <span>-₹{lastSettledBill.discount.toFixed(2)}</span>
                  </div>
                )}
                {lastSettledBill.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>GST ({lastSettledBill.taxRate}%):</span>
                    <span>₹{lastSettledBill.taxAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="py-2 border-b-2 border-black flex justify-between font-black text-xs">
                <span>TOTAL:</span>
                <span>₹{lastSettledBill.finalAmount.toFixed(2)}</span>
              </div>

              {/* TENDER AND BALANCE DUE PRINTED ON RECEIPT */}
              <div className="py-1.5 border-b border-dashed border-black text-[10px] space-y-0.5">
                <div className="flex justify-between font-bold">
                  <span>Payment Mode:</span>
                  <span>{lastSettledBill.paymentMethod.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Received:</span>
                  <span>₹{lastSettledBill.amountReceived.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-xs">
                  <span>BALANCE RETURNED:</span>
                  <span>₹{lastSettledBill.balanceAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[9px]">
                <p className="font-bold">{settings.receiptFooterMessage}</p>
                <p className="text-[8px] mt-1 font-tamil">காரைக்குடி பாரம்பரிய மெஸ்</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
