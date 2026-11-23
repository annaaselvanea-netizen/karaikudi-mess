'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { Order, OrderStatus } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import {
  ClipboardList,
  Search,
  Printer,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Filter,
} from 'lucide-react';

export function OrderManagement() {
  const { orders, bills, updateOrderStatus, setActivePrintedBill } = useRestaurant();
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'kds'>('table');

  const filteredOrders = orders.filter((order) => {
    const matchStatus =
      selectedStatus === 'All' || order.status.toLowerCase() === selectedStatus.toLowerCase();

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      order.orderNumber.toLowerCase().includes(q) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.tableNumber && order.tableNumber.toLowerCase().includes(q)) ||
      (order.customerPhone && order.customerPhone.includes(q));

    return matchStatus && matchSearch;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const handlePrintOrderBill = (order: Order) => {
    // Look up associated bill
    const bill = bills.find((b) => b.orderId === order.id || b.orderNumber === order.orderNumber);
    if (bill) {
      setActivePrintedBill(bill);
    } else {
      // Create bill projection
      const fakeBill = {
        id: 'bill-' + order.id,
        billNumber: order.billNumber || 'KM-' + order.orderNumber,
        orderId: order.id,
        orderNumber: order.orderNumber,
        tokenNumber: order.tokenNumber,
        date: order.createdAt.split('T')[0],
        time: order.createdAt.split('T')[1]?.slice(0, 8) || '12:00:00',
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        orderType: order.orderType,
        tableNumber: order.tableNumber,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount,
        taxRate: 5,
        taxAmount: order.taxAmount,
        finalAmount: order.finalAmount,
        paymentMethod: order.paymentMethod || 'cash',
        amountReceived: order.finalAmount,
        balanceAmount: 0,
        paymentStatus: order.paymentStatus,
        cashierName: 'Counter Cashier',
      };
      setActivePrintedBill(fakeBill);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            Order Management & Kitchen Display
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-bold">
              {orders.length} Total Orders
            </span>
          </h2>
          <p className="text-xs text-stone-500 font-tamil mt-0.5">
            வாடிக்கையாளர் ஆர்டர் நிலை, தயாரிப்பு மற்றும் பில் விபரங்கள்
          </p>
        </div>

        {/* View Mode Toggle: Table View vs KDS (Kitchen Display System) */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              viewMode === 'table' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-500'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Table View</span>
          </button>
          <button
            onClick={() => setViewMode('kds')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              viewMode === 'kds' ? 'bg-[#441a0e] text-white shadow font-bold' : 'text-stone-500'
            }`}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>Kitchen Display (KDS)</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order #, Customer, Phone, Table..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto self-stretch md:self-auto text-xs">
          {['All', 'Pending', 'Preparing', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
                selectedStatus === status
                  ? 'bg-brand-700 text-white font-bold shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Content depending on viewMode */}
      {viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#441a0e] text-white uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4">Order / Token</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Type & Table</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Dishes Ordered</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Order Status</th>
                  <th className="py-3 px-4 text-center">Print / Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-stone-400">
                      No orders found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-brand-950 block text-sm">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 inline-block">
                          Token #{order.tokenNumber}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-stone-600">
                        {formatDateTime(order.createdAt)}
                      </td>

                      <td className="py-3 px-4">
                        <span className="inline-block uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                          {order.orderType}
                        </span>
                        {order.tableNumber && (
                          <span className="block text-[11px] text-stone-600 font-semibold mt-0.5">
                            {order.tableNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-stone-900 block">
                          {order.customerName || 'Walk-in'}
                        </span>
                        {order.customerPhone && (
                          <span className="text-[10px] text-stone-500 font-mono">
                            {order.customerPhone}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          {order.items.map((i, idx) => (
                            <div key={idx} className="text-[11px] text-stone-700 truncate">
                              <span className="font-bold text-stone-900">{i.quantity}x</span> {i.name}
                              {i.specialInstructions && (
                                <span className="text-[10px] text-amber-700 italic ml-1">
                                  ({i.specialInstructions})
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-stone-900 text-sm">
                        {formatCurrency(order.finalAmount)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value as OrderStatus)
                          }
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handlePrintOrderBill(order)}
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#441a0e] border border-amber-200 rounded-lg text-xs font-semibold flex items-center gap-1 mx-auto transition"
                          title="Print Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Kitchen Display System (KDS Grid) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`bg-white rounded-2xl border-2 flex flex-col justify-between shadow-sm overflow-hidden ${
                order.status === 'pending'
                  ? 'border-amber-400 bg-amber-50/20'
                  : order.status === 'preparing'
                  ? 'border-blue-400 bg-blue-50/20'
                  : 'border-stone-200'
              }`}
            >
              {/* Card Header */}
              <div
                className={`p-3 border-b flex items-center justify-between text-xs font-bold ${
                  order.status === 'pending'
                    ? 'bg-amber-100 text-amber-900 border-amber-200'
                    : order.status === 'preparing'
                    ? 'bg-blue-100 text-blue-900 border-blue-200'
                    : 'bg-stone-100 text-stone-800 border-stone-200'
                }`}
              >
                <div>
                  <span className="text-base font-black">Token #{order.tokenNumber}</span>
                  <span className="ml-2 font-mono text-stone-600">({order.orderNumber})</span>
                </div>
                <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-white font-bold">
                  {order.orderType} {order.tableNumber ? `• ${order.tableNumber}` : ''}
                </span>
              </div>

              {/* Items List for Chefs */}
              <div className="p-4 flex-1 space-y-2">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 border-b border-dashed border-stone-200 pb-1.5"
                  >
                    <div>
                      <span className="font-bold text-sm text-stone-900">{item.name}</span>
                      {item.tamilName && (
                        <span className="text-[10px] text-stone-500 font-tamil block">
                          {item.tamilName}
                        </span>
                      )}
                      {item.specialInstructions && (
                        <span className="text-[11px] text-red-600 font-bold block">
                          Note: {item.specialInstructions}
                        </span>
                      )}
                    </div>
                    <span className="text-base font-black font-mono bg-stone-100 px-2 py-0.5 rounded-lg text-stone-900">
                      x{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Card Footer Status Toggles */}
              <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                  >
                    Mark as Ready / Served
                  </button>
                )}
                {order.status === 'completed' && (
                  <div className="w-full py-1.5 text-center text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl">
                    Order Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
