'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { formatCurrency } from '@/lib/utils';
import { OrderType } from '@/types';
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
  Layers,
  Percent,
} from 'lucide-react';
import { PosPaymentModal } from './PosPaymentModal';

export function PosCart() {
  const {
    cart,
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
  } = useRestaurant();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingInstructionId, setEditingInstructionId] = useState<string | null>(null);
  const [instructionText, setInstructionText] = useState<string>('');
  const [discountInput, setDiscountInput] = useState<string>(cartDiscount ? String(cartDiscount) : '');

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

  return (
    <>
      <div className="w-full lg:w-96 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col h-full overflow-hidden">
        {/* Header: Order Type (Dine-in / Takeaway / Parcel) */}
        <div className="p-3.5 bg-[#441a0e] text-white">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-black/25 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setOrderType('dine-in')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
                orderType === 'dine-in' ? 'bg-amberGold-500 text-stone-950 font-bold shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Utensils className="w-3.5 h-3.5" />
              <span>Dine-In</span>
            </button>
            <button
              onClick={() => setOrderType('takeaway')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
                orderType === 'takeaway' ? 'bg-amberGold-500 text-stone-950 font-bold shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Takeaway</span>
            </button>
            <button
              onClick={() => setOrderType('parcel')}
              className={`py-1.5 px-2 rounded-lg flex items-center justify-center gap-1 transition ${
                orderType === 'parcel' ? 'bg-amberGold-500 text-stone-950 font-bold shadow' : 'text-stone-300 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Parcel</span>
            </button>
          </div>

          {/* Table Number & Customer Details Row */}
          <div className="grid grid-cols-2 gap-2 mt-2.5 text-xs">
            {orderType === 'dine-in' ? (
              <div>
                <label className="text-[10px] text-amber-200 font-medium">Table No.</label>
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
                <div className="mt-0.5 px-2 py-1.5 bg-[#2d1109] border border-brand-700 text-amber-300 rounded-lg font-bold text-xs">
                  {orderType.toUpperCase()} COUNTER
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] text-amber-200 font-medium">Customer Mobile (Opt)</label>
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

          <div className="mt-1.5">
            <div className="relative">
              <User className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-brand-400" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Customer Name (Optional)"
                className="w-full pl-6 pr-2 py-1 bg-[#2d1109] border border-brand-700 text-white rounded-lg text-xs placeholder-brand-500/70 focus:outline-none focus:ring-1 focus:ring-amberGold-400"
              />
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-stone-50/70 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center p-6">
              <ShoppingBag className="w-12 h-12 text-stone-300 mb-2" />
              <p className="text-sm font-bold text-stone-600">Cart is empty</p>
              <p className="text-xs text-stone-400 mt-1">
                Tap items on the left menu grid to add them to this bill.
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
                        {item.name}
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

                  <span className="font-mono font-bold text-xs text-stone-900 w-16 text-right">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>

                {/* Special Instruction Edit Button */}
                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100 text-[10px]">
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
                    <span>{item.specialInstructions ? 'Edit Note' : '+ Add Note (e.g. Less spicy)'}</span>
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
                      placeholder="e.g. No onion / Extra gravy / Crispy"
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

        {/* Calculation & Bill Settlement Section */}
        <div className="p-3.5 bg-white border-t border-stone-200 space-y-2">
          {/* Discount Input */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Percent className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="number"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                placeholder="Discount amount (₹)"
                className="w-full pl-6 pr-2 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={handleApplyDiscount}
              className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition"
            >
              Apply
            </button>
          </div>

          {/* Subtotals & Taxes */}
          <div className="space-y-1 text-xs text-stone-600 pt-1">
            <div className="flex justify-between">
              <span>Items ({cartTotalQuantity}):</span>
              <span className="font-mono font-medium">{formatCurrency(cartSubtotal)}</span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Discount Applied:</span>
                <span className="font-mono font-medium">-{formatCurrency(cartDiscount)}</span>
              </div>
            )}
            {cartTax > 0 && (
              <div className="flex justify-between text-stone-600">
                <span>GST ({settings?.taxRate}%):</span>
                <span className="font-mono font-medium">{formatCurrency(cartTax)}</span>
              </div>
            )}
          </div>

          {/* Final Amount Banner */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                Total Amount
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
                Clear Cart
              </button>
            )}
          </div>

          {/* Settle Bill Button */}
          <button
            onClick={() => setPaymentModalOpen(true)}
            disabled={cart.length === 0}
            className={`w-full py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition active:scale-98 ${
              cart.length === 0
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-600 via-brand-700 to-amberGold-600 hover:from-brand-700 hover:to-amberGold-500 text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pay & Generate Bill ({formatCurrency(cartTotal)})</span>
          </button>
        </div>
      </div>

      {/* Payment Settlement Modal */}
      {paymentModalOpen && (
        <PosPaymentModal
          totalAmount={cartTotal}
          onClose={() => setPaymentModalOpen(false)}
        />
      )}
    </>
  );
}
