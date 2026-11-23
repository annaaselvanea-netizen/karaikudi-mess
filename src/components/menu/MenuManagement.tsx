'use client';

import React, { useState } from 'react';
import { useRestaurant } from '@/context/RestaurantContext';
import { MenuItem, FoodType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Flame,
  Check,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export function MenuManagement() {
  const { menuItems, categories, addMenuItem, updateMenuItem, deleteMenuItem, seedDemoData } =
    useRestaurant();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterType, setFilterType] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [tamilName, setTamilName] = useState('');
  const [category, setCategory] = useState(categories[1]?.name || 'Breakfast');
  const [price, setPrice] = useState<number>(100);
  const [foodType, setFoodType] = useState<FoodType>('non-veg');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isPopular, setIsPopular] = useState(false);

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setTamilName('');
    setCategory(categories[1]?.name || 'Meals');
    setPrice(150);
    setFoodType('non-veg');
    setImage('https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=80');
    setDescription('');
    setIsAvailable(true);
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setTamilName(item.tamilName || '');
    setCategory(item.category);
    setPrice(item.price);
    setFoodType(item.foodType);
    setImage(item.image);
    setDescription(item.description || '');
    setIsAvailable(item.isAvailable);
    setIsPopular(item.isPopular || false);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price <= 0) return;

    if (editingItem) {
      await updateMenuItem({
        ...editingItem,
        name: name.trim(),
        tamilName: tamilName.trim() || undefined,
        category,
        price,
        foodType,
        image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
        description: description.trim() || undefined,
        isAvailable,
        isPopular,
      });
    } else {
      const newItem: MenuItem = {
        id: 'item-' + Date.now(),
        name: name.trim(),
        tamilName: tamilName.trim() || undefined,
        category,
        price,
        foodType,
        image: image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
        description: description.trim() || undefined,
        isAvailable,
        isPopular,
      };
      await addMenuItem(newItem);
    }

    setIsModalOpen(false);
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    await updateMenuItem({
      ...item,
      isAvailable: !item.isAvailable,
    });
  };

  const filteredItems = menuItems.filter((item) => {
    const matchCat =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchType = filterType === 'all' || item.foodType === filterType;
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.tamilName && item.tamilName.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q);

    return matchCat && matchType && matchSearch;
  });

  return (
    <div className="space-y-5">
      {/* Page Title & Top Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            Food Menu Management
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-800 font-bold">
              {menuItems.length} Dishes
            </span>
          </h2>
          <p className="text-xs text-stone-500 font-tamil mt-0.5">
            உணவுப் பட்டியல் நிர்வாகம் • விலைகள், கிடைக்கும் தன்மை மாற்றம்
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={seedDemoData}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
            title="Reset to default authentic Chettinad dishes"
          >
            Reset Sample Menu
          </button>
          <button
            onClick={openAddModal}
            className="px-4 py-2 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 hover:to-amberGold-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish by English or தமிழ்..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto">
          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="All">All Categories</option>
            {categories
              .filter((c) => c.id !== 'cat-all')
              .map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
          </select>

          {/* Veg / Non-Veg filter */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                filterType === 'all' ? 'bg-white shadow text-stone-900 font-bold' : 'text-stone-500'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('veg')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                filterType === 'veg' ? 'bg-emerald-600 text-white shadow font-bold' : 'text-stone-500'
              }`}
            >
              Veg
            </button>
            <button
              onClick={() => setFilterType('non-veg')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                filterType === 'non-veg' ? 'bg-red-600 text-white shadow font-bold' : 'text-stone-500'
              }`}
            >
              Non-Veg
            </button>
          </div>
        </div>
      </div>

      {/* Dishes Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#441a0e] text-white uppercase text-[11px] font-bold">
              <tr>
                <th className="py-3 px-4 w-16 text-center">Item</th>
                <th className="py-3 px-4">Dish Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">In Stock?</th>
                <th className="py-3 px-4 text-center">Popular?</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <tr
                  key={item.id}
                  className={`hover:bg-amber-50/50 transition ${
                    !item.isAvailable ? 'opacity-50 bg-stone-50' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <td className="py-2.5 px-4 text-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover mx-auto shadow-xs"
                      loading="lazy"
                    />
                  </td>

                  {/* Name */}
                  <td className="py-2.5 px-4">
                    <span className="font-bold text-stone-900 text-sm block">{item.name}</span>
                    {item.tamilName && (
                      <span className="text-[11px] text-stone-500 font-tamil block">
                        {item.tamilName}
                      </span>
                    )}
                    {item.description && (
                      <span className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-2.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 font-medium">
                      {item.category}
                    </span>
                  </td>

                  {/* Veg / Non-Veg */}
                  <td className="py-2.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                        item.foodType === 'veg'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.foodType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                        }`}
                      />
                      {item.foodType === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="py-2.5 px-4 text-right font-mono font-black text-stone-900 text-sm">
                    {formatCurrency(item.price)}
                  </td>

                  {/* Availability Toggle */}
                  <td className="py-2.5 px-4 text-center">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                        item.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </button>
                  </td>

                  {/* Popular Badge */}
                  <td className="py-2.5 px-4 text-center">
                    {item.isPopular ? (
                      <span className="inline-flex items-center gap-0.5 text-orange-600 font-bold text-[10px]">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        Yes
                      </span>
                    ) : (
                      <span className="text-stone-300">-</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-brand-700 hover:bg-brand-50 transition"
                        title="Edit Dish"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                            deleteMenuItem(item.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete Dish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dish Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-stone-200">
            <div className="flex items-center justify-between px-6 py-4 bg-[#441a0e] text-white">
              <h3 className="font-bold text-base">
                {editingItem ? 'Edit Dish Details' : 'Add New Chettinad Dish'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Dish Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Chettinad Mutton Biryani"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tamil Name (தமிழ்)</label>
                  <input
                    type="text"
                    value={tamilName}
                    onChange={(e) => setTamilName(e.target.value)}
                    placeholder="மட்டன் பிரியாணி"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-tamil focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories
                      .filter((c) => c.id !== 'cat-all')
                      .map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Food Type *</label>
                  <select
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value as FoodType)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="non-veg">Non-Veg</option>
                    <option value="veg">Pure Veg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Food Image URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  {image && (
                    <img
                      src={image}
                      alt="preview"
                      className="w-9 h-9 rounded-lg object-cover border border-stone-200"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ingredients, preparation style or serving details..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">In Stock (Available in POS)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-semibold text-stone-800">Chef&apos;s Special / Popular</span>
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-brand-600 to-amberGold-600 hover:from-brand-700 text-white rounded-xl font-bold shadow"
                >
                  {editingItem ? 'Save Changes' : 'Create Dish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
