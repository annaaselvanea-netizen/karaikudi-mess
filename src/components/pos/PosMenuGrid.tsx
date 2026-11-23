'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { useLanguage } from '@/context/LanguageContext';
import { MenuItem, Category } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Search, Plus, Minus, Flame } from 'lucide-react';

export function PosMenuGrid() {
  const { menuItems, categories, cart, addToCart, updateQuantity } = useRestaurant();
  const { language, t } = useLanguage();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Filter items
  const filteredItems = menuItems.filter((item) => {
    // Category match
    const categoryMatch =
      selectedCategory === 'All Items' ||
      selectedCategory === 'cat-all' ||
      selectedCategory === 'அனைத்தும்' ||
      item.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      selectedCategory.toLowerCase().includes(item.category.toLowerCase());

    // Food type match
    const typeMatch = filterType === 'all' || item.foodType === filterType;

    // Search query match
    const query = searchQuery.trim().toLowerCase();
    const searchMatch =
      !query ||
      item.name.toLowerCase().includes(query) ||
      (item.tamilName && item.tamilName.toLowerCase().includes(query)) ||
      item.category.toLowerCase().includes(query);

    return categoryMatch && typeMatch && searchMatch;
  });

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
      {/* Top Controls: Search, Veg/Non-Veg filter */}
      <div className="p-4 border-b border-stone-200 bg-amber-50/40 flex flex-col sm:flex-row gap-3 items-center justify-between shrink-0">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('pos.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2 bg-white rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 shadow-sm"
          />
        </div>

        {/* Veg / Non-Veg Filters */}
        <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl self-stretch sm:self-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'all' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {t('pos.all')}
          </button>
          <button
            onClick={() => setFilterType('veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'veg' ? 'bg-emerald-600 text-white shadow font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 border border-white" />
            <span>{t('pos.veg')}</span>
          </button>
          <button
            onClick={() => setFilterType('non-veg')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
              filterType === 'non-veg' ? 'bg-red-600 text-white shadow font-bold' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400 border border-white" />
            <span>{t('pos.nonVeg')}</span>
          </button>
        </div>
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-200 overflow-x-auto flex items-center gap-2 no-scrollbar shrink-0">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.name || (cat.id === 'cat-all' && selectedCategory === 'All Items');
          const primaryName = language === 'ta' && cat.tamilName ? cat.tamilName : cat.name;
          const secondaryName = language === 'ta' ? cat.name : cat.tamilName;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all font-medium flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#441a0e] text-white shadow font-bold'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <span className={language === 'ta' ? 'font-tamil' : ''}>{primaryName}</span>
              {secondaryName && (
                <span className={`text-[10px] opacity-75 ${isSelected ? 'text-amber-300' : 'text-stone-500'}`}>
                  ({secondaryName})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Menu Cards Grid */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
        {filteredItems.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-stone-400">
            <Flame className="w-12 h-12 text-stone-300 mb-2" />
            <p className="text-sm font-semibold">
              {language === 'ta' ? 'உணவுகள் எதுவும் கிடைக்கவில்லை' : 'No food items found matching your filters'}
            </p>
            <p className="text-xs">
              {language === 'ta' ? 'வேறு பிரிவை அல்லது வடிகட்டியை தேர்வு செய்யவும்' : 'Try selecting another category or clear search terms'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredItems.map((item) => {
              const inCartItem = cart.find((c) => c.menuItemId === item.id);
              const qty = inCartItem?.quantity || 0;

              const dishTitle = language === 'ta' && item.tamilName ? item.tamilName : item.name;
              const dishSubtitle = language === 'ta' ? item.name : item.tamilName;

              return (
                <div
                  key={item.id}
                  className={`group relative bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden hover:shadow-lg ${
                    qty > 0 ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-stone-200 hover:border-brand-300'
                  } ${!item.isAvailable ? 'opacity-60 grayscale' : ''}`}
                >
                  {/* Food Image */}
                  <div className="relative h-28 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />

                    {/* Veg / Non-Veg Indicator */}
                    <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm border border-stone-200 flex items-center justify-center">
                      <div
                        className={`w-3.5 h-3.5 border-2 flex items-center justify-center ${
                          item.foodType === 'veg' ? 'border-emerald-600' : 'border-red-600'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.foodType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Popular Badge */}
                    {item.isPopular && (
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5" />
                        <span>{t('pos.popular')}</span>
                      </div>
                    )}

                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs font-bold uppercase tracking-wider">
                        {t('pos.outOfStock')}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className={`text-xs font-bold text-stone-900 group-hover:text-brand-800 transition line-clamp-1 leading-snug ${
                          language === 'ta' ? 'font-tamil text-[13px]' : ''
                        }`}>
                          {dishTitle}
                        </h4>
                      </div>
                      {dishSubtitle && (
                        <p className="text-[10px] text-stone-500 font-tamil truncate">{dishSubtitle}</p>
                      )}
                      <p className="text-[10px] text-stone-400 mt-0.5">{item.category}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-100">
                      <span className="font-mono font-black text-sm text-[#441a0e]">
                        {formatCurrency(item.price)}
                      </span>

                      {/* Add or Counter Button */}
                      {item.isAvailable && (
                        <div>
                          {qty > 0 ? (
                            <div className="flex items-center gap-1.5 bg-brand-50 border border-brand-300 rounded-lg p-0.5">
                              <button
                                onClick={() => updateQuantity(item.id, qty - 1)}
                                className="w-6 h-6 rounded bg-white text-brand-900 hover:bg-brand-100 flex items-center justify-center transition shadow-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-brand-900 px-1 font-mono">{qty}</span>
                              <button
                                onClick={() => updateQuantity(item.id, qty + 1)}
                                className="w-6 h-6 rounded bg-brand-600 text-white hover:bg-brand-700 flex items-center justify-center transition shadow-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              className="px-3 py-1 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 hover:to-amberGold-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                              <span>{t('pos.add')}</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
