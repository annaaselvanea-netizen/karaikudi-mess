'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { RestaurantSettings } from '@/types';
import {
  Settings,
  Building2,
  Printer,
  Receipt,
  FileSpreadsheet,
  Database,
  CheckCircle2,
  Save,
  RotateCcw,
} from 'lucide-react';

export function SettingsView() {
  const { settings, updateSettings, seedDemoData, showToast } = useRestaurant();

  const [form, setForm] = useState<RestaurantSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof RestaurantSettings, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateSettings(form);
    setIsSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-700" />
          Restaurant Profile & System Configuration
        </h2>
        <p className="text-xs text-stone-500 font-tamil mt-0.5">
          ஹோட்டல் பெயர், முகவரி, ஜி.எஸ்.டி, பிரிண்டர் & கூகுள் தாள்கள் அமைப்புகள்
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: Restaurant Profile */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Building2 className="w-4 h-4 text-brand-600" />
            Restaurant Identity & Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Restaurant Name (English) *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Tamil Subheading (தமிழ்)</label>
              <input
                type="text"
                value={form.tamilName || ''}
                onChange={(e) => handleChange('tamilName', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-tamil focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Tagline</label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="font-bold text-stone-700 block mb-1">Complete Address *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Phone Number(s) *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={form.gstin || ''}
                onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                placeholder="33AABCK1234F1Z8"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="font-bold text-stone-700 block mb-1">FSSAI License Number</label>
              <input
                type="text"
                value={form.fssaiNumber || ''}
                onChange={(e) => handleChange('fssaiNumber', e.target.value)}
                placeholder="12419008000456"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Billing & Tax Settings */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Receipt className="w-4 h-4 text-emerald-600" />
            Billing & GST Tax Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Invoice Prefix</label>
              <input
                type="text"
                value={form.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())}
                placeholder="KM"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[10px] text-stone-400 mt-1">Generates: {form.invoicePrefix}-YYYYMMDD-XXXX</p>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                min={0}
                max={28}
                value={form.taxRate}
                onChange={(e) => handleChange('taxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <p className="text-[10px] text-stone-400 mt-1">2.5% CGST + 2.5% SGST</p>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Currency Symbol</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.taxEnabled}
                onChange={(e) => handleChange('taxEnabled', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <span className="font-semibold text-stone-800">
                Enable GST calculation on customer bills (5% Restaurant GST)
              </span>
            </label>
          </div>
        </div>

        {/* Section 3: Thermal & A4 Printer Hardware Settings */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2 border-b border-stone-100 pb-3">
            <Printer className="w-4 h-4 text-purple-600" />
            Thermal & A4 Printer Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Thermal Receipt Roll Width *</label>
              <select
                value={form.thermalPaperSize}
                onChange={(e) => handleChange('thermalPaperSize', e.target.value as any)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="80mm">80mm Paper Width (Standard Restaurant POS)</option>
                <option value="58mm">58mm Paper Width (Compact Bluetooth Printer)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Receipt Footer Message</label>
              <input
                type="text"
                value={form.receiptFooterMessage}
                onChange={(e) => handleChange('receiptFooterMessage', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl font-tamil focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.thermalCutPaper}
                onChange={(e) => handleChange('thermalCutPaper', e.target.checked)}
                className="w-4 h-4 text-brand-600 rounded"
              />
              <span className="font-semibold text-stone-800">
                Send ESC/POS Auto-Cut Paper command (GS V 65 3)
              </span>
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={seedDemoData}
            className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reload Chettinad Demo Menu Data</span>
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-md transition active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
