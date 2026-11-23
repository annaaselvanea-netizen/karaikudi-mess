import { MenuItem, Category, RestaurantSettings, Expense, AppUser } from '@/types';

export const DEFAULT_SETTINGS: RestaurantSettings = {
  name: 'Karaikudi Mess',
  tamilName: 'காரைக்குடி மெஸ்',
  tagline: 'Authentic Chettinad Flavours & Traditional Hospitality',
  address: 'No. 42, Chettiar Street, Karaikudi, Tamil Nadu - 630001',
  phone: '+91 98421 76543 / 04565-224488',
  email: 'contact@karaikudimess.in',
  gstin: '33AABCK1234F1Z8',
  fssaiNumber: '12419008000456',
  currencySymbol: '₹',
  taxRate: 5, // 5% GST (2.5% CGST + 2.5% SGST)
  taxEnabled: true,
  invoicePrefix: 'KM',
  thermalPaperSize: '80mm',
  receiptFooterMessage: 'நன்றி! மீண்டும் வருக! / Thank You! Please Visit Again!',
  thermalCutPaper: true,
  sheetsWebhookUrl: '',
  sheetsAutoSync: true,
  firebaseProjectId: 'karaikudi-mess-pos',
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-all', name: 'All Items', tamilName: 'அனைத்தும்', sortOrder: 0 },
  { id: 'cat-breakfast', name: 'Breakfast', tamilName: 'காலை உணவு', sortOrder: 1 },
  { id: 'cat-meals', name: 'Meals', tamilName: 'மதிய சாப்பாடு', sortOrder: 2 },
  { id: 'cat-non-veg', name: 'Chettinad Non-Veg', tamilName: 'அசைவ வகைகள்', sortOrder: 3 },
  { id: 'cat-veg', name: 'Chettinad Veg', tamilName: 'சைவ வகைகள்', sortOrder: 4 },
  { id: 'cat-dinner', name: 'Dinner & Tiffin', tamilName: 'இரவு சிற்றுண்டி', sortOrder: 5 },
  { id: 'cat-snacks', name: 'Snacks & Starters', tamilName: 'கார வகைகள்', sortOrder: 6 },
  { id: 'cat-beverages', name: 'Beverages', tamilName: 'குளிர்பானங்கள்', sortOrder: 7 },
  { id: 'cat-extras', name: 'Extra Items', tamilName: 'கூடுதல் வகைகள்', sortOrder: 8 },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Breakfast
  {
    id: 'item-1',
    name: 'Kari Dosa (Mutton)',
    tamilName: 'கறி தோசை (மட்டன்)',
    category: 'Breakfast',
    price: 220,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Crispy thick dosa layered with spicy minced Chettinad mutton and egg masala.'
  },
  {
    id: 'item-2',
    name: 'Ghee Podi Idli (4 Pcs)',
    tamilName: 'நெய் பொடி இட்லி',
    category: 'Breakfast',
    price: 90,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Soft steamed idlis tossed in pure aromatic cow ghee and spicy gun powder.'
  },
  {
    id: 'item-3',
    name: 'Chettinad Idiyappam & Paal',
    tamilName: 'இடியாப்பம் தேங்காய்ப்பால்',
    category: 'Breakfast',
    price: 80,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'String hoppers served with sweet cardamom coconut milk and spicy kurma.'
  },
  {
    id: 'item-4',
    name: 'Medu Vadai (2 Pcs)',
    tamilName: 'மெது வடை',
    category: 'Breakfast',
    price: 50,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Golden crunchy lentil fritters spiced with peppercorns, ginger, and curry leaves.'
  },
  {
    id: 'item-5',
    name: 'Nattu Kozhi Kari Idli',
    tamilName: 'நாட்டுக்கோழி கறி இட்லி',
    category: 'Breakfast',
    price: 180,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Fluffy idlis drenched in authentic country chicken kozhambu gravy.'
  },

  // Meals
  {
    id: 'item-6',
    name: 'Chettinad Special Non-Veg Meals',
    tamilName: 'செட்டிநாடு ஸ்பெஷல் அசைவ சாப்பாடு',
    category: 'Meals',
    price: 240,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Full banana leaf meals with Chicken Gravy, Mutton Gravy, Fish Curry, Rasam, Curd, Kootu, Poriyal, Appalam & Sweet.'
  },
  {
    id: 'item-7',
    name: 'Traditional Chettinad Veg Meals',
    tamilName: 'பாரம்பரிய சைவ சாப்பாடு',
    category: 'Meals',
    price: 150,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Ponni boiled rice with Vatha Kozhambu, Sambar, Rasam, More Kozhambu, Poriyal, Kootu, Appalam & Payasam.'
  },
  {
    id: 'item-8',
    name: 'Seeraga Samba Chicken Biryani',
    tamilName: 'சீரக சம்பா சிக்கன் பிரியாணி',
    category: 'Meals',
    price: 230,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Fragrant Seeraga Samba rice slow cooked with Chettinad country spices, served with Dalcha & Onion Raita.'
  },
  {
    id: 'item-9',
    name: 'Chettinad Mutton Biryani',
    tamilName: 'செட்டிநாடு மட்டன் பிரியாணி',
    category: 'Meals',
    price: 320,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Tender baby goat pieces cooked in flavorful short-grain rice with stone-ground Chettinad masala.'
  },

  // Chettinad Non-Veg
  {
    id: 'item-10',
    name: 'Chettinad Mutton Chukka',
    tamilName: 'மட்டன் சுக்கா வறுவல்',
    category: 'Chettinad Non-Veg',
    price: 280,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Dry roasted tender goat meat sautéed with shallots, crushed pepper, garlic, and freshly grounded spices.'
  },
  {
    id: 'item-11',
    name: 'Nattu Kozhi Pepper Roast',
    tamilName: 'நாட்டுக்கோழி மிளகு வறுவல்',
    category: 'Chettinad Non-Veg',
    price: 250,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Free-range country chicken pan-roasted with spicy black pepper, curry leaves, and gingelly oil.'
  },
  {
    id: 'item-12',
    name: 'Chettinad Chicken Kozhambu',
    tamilName: 'காரைக்குடி சிக்கன் குழம்பு',
    category: 'Chettinad Non-Veg',
    price: 210,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Rich, aromatic chicken curry prepared with freshly roasted coconut, kalpasi, and star anise.'
  },
  {
    id: 'item-13',
    name: 'Vanjaram Fish Fry (Seer Fish)',
    tamilName: 'வஞ்சிரம் மீன் வறுவல்',
    category: 'Chettinad Non-Veg',
    price: 260,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Fresh cut Seer fish slice marinated with heirloom red chilli paste and shallow tawa fried.'
  },
  {
    id: 'item-14',
    name: 'Karaikudi Crab Roast (Nandu Masala)',
    tamilName: 'நண்டு வறுவல்',
    category: 'Chettinad Non-Veg',
    price: 290,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1559742811-822873691df8?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Fresh sea crab cooked in fiery pepper and fennel laced gravy.'
  },

  // Chettinad Veg
  {
    id: 'item-15',
    name: 'Ennai Kathirikai Kozhambu',
    tamilName: 'எண்ணெய் கத்திரிக்காய் குழம்பு',
    category: 'Chettinad Veg',
    price: 130,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Baby brinjals stuffed with masala and slow simmered in tangy sesame oil tamarind gravy.'
  },
  {
    id: 'item-16',
    name: 'Chettinad Mushroom Chukka',
    tamilName: 'காளான் சுக்கா',
    category: 'Chettinad Veg',
    price: 160,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Button mushrooms sautéed with spicy shallots and cracked black pepper.'
  },
  {
    id: 'item-17',
    name: 'Urulai Roast (Baby Potato)',
    tamilName: 'உருளைக்கிழங்கு வறுவல்',
    category: 'Chettinad Veg',
    price: 110,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Crispy roasted baby potatoes with Chettinad chilli and garlic spices.'
  },

  // Dinner & Tiffin
  {
    id: 'item-18',
    name: 'Bun Parotta (2 Pcs) with Salna',
    tamilName: 'பன் பரோட்டா சால்னா',
    category: 'Dinner & Tiffin',
    price: 100,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Fluffy, flaky, multilayered crispy round bun parottas served with piping hot Karaikudi salna.'
  },
  {
    id: 'item-19',
    name: 'Chicken Kothu Parotta',
    tamilName: 'சிக்கன் கொத்து பரோட்டா',
    category: 'Dinner & Tiffin',
    price: 190,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Shredded parottas beaten on iron griddle with egg, spiced chicken pieces, and spicy salna.'
  },
  {
    id: 'item-20',
    name: 'Muttai Dosa (Egg Dosa)',
    tamilName: 'முட்டை தோசை',
    category: 'Dinner & Tiffin',
    price: 90,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Crisp dosa topped with farm egg, pepper, and freshly chopped onions.'
  },

  // Snacks & Starters
  {
    id: 'item-21',
    name: 'Chettinad Chicken 65',
    tamilName: 'சிக்கன் 65',
    category: 'Snacks & Starters',
    price: 180,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Crispy deep-fried spicy boneless chicken cubes garnished with fried green chillies and curry leaves.'
  },
  {
    id: 'item-22',
    name: 'Chettinad Kola Urundai (Mutton Keema Balls)',
    tamilName: 'மட்டன் கோலா உருண்டை (4 எண்ணம்)',
    category: 'Snacks & Starters',
    price: 210,
    foodType: 'non-veg',
    image: 'https://images.unsplash.com/photo-1545247181-516773cae754?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Traditional minced mutton meatballs with roasted gram and fennel, crispy on outside, melt in mouth inside.'
  },

  // Beverages
  {
    id: 'item-23',
    name: 'Kumbakonam Degree Coffee',
    tamilName: 'கும்பகோணம் டிகிரி காபி',
    category: 'Beverages',
    price: 35,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Fresh decoction brewed with chicory-blend coffee beans and boiled pure farm cow milk in brass davarah.'
  },
  {
    id: 'item-24',
    name: 'Special Madurai Jigarthanda',
    tamilName: 'ஸ்பெஷல் ஜிகர்தண்டா',
    category: 'Beverages',
    price: 85,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    isPopular: true,
    description: 'Chilled royal drink made with badam pisin, nannari syrup, reduced milk (basundi), and rich ice cream.'
  },
  {
    id: 'item-25',
    name: 'Masala Mor (Spiced Buttermilk)',
    tamilName: 'மசாலா மோர்',
    category: 'Beverages',
    price: 30,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Refreshing churned curd tempered with ginger, green chilli, curry leaves, and asafoetida.'
  },

  // Extras
  {
    id: 'item-26',
    name: 'Kal Dosa (Single)',
    tamilName: 'கல் தோசை',
    category: 'Extra Items',
    price: 30,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Thick, spongy soft iron tawa dosa.'
  },
  {
    id: 'item-27',
    name: 'Extra Parotta',
    tamilName: 'பரோட்டா (1 எண்ணம்)',
    category: 'Extra Items',
    price: 25,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Crispy flaky parotta single piece.'
  },
  {
    id: 'item-28',
    name: 'Curd Cup',
    tamilName: 'தயிர் கப்',
    category: 'Extra Items',
    price: 20,
    foodType: 'veg',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=80',
    isAvailable: true,
    description: 'Fresh thick set curd.'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    expenseNumber: 'EXP-2026-001',
    date: new Date().toISOString().split('T')[0],
    time: '07:30:00',
    category: 'Vegetables',
    description: 'Daily fresh market vegetables (Shallots, Tomatoes, Green Chillies, Curry Leaves)',
    amount: 3450,
    paymentMethod: 'cash',
    vendorName: 'Madurai Uzhavar Sandhai',
    paidBy: 'Store Manager',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-2',
    expenseNumber: 'EXP-2026-002',
    date: new Date().toISOString().split('T')[0],
    time: '08:00:00',
    category: 'Meat & Poultry',
    description: 'Fresh farm chicken (25 kg) & Country Chicken (12 kg)',
    amount: 8200,
    paymentMethod: 'upi',
    vendorName: 'Chettinad Broiler Farms',
    paidBy: 'Store Manager',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-3',
    expenseNumber: 'EXP-2026-003',
    date: new Date().toISOString().split('T')[0],
    time: '08:45:00',
    category: 'Dairy',
    description: 'Pure Cow Milk (40 Litres) & Butter for Ghee',
    amount: 2800,
    paymentMethod: 'cash',
    vendorName: 'Aavin Milk Centre',
    paidBy: 'Cashier',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'exp-4',
    expenseNumber: 'EXP-2026-004',
    date: new Date().toISOString().split('T')[0],
    time: '11:15:00',
    category: 'LPG & Fuel',
    description: '2 Commercial 19kg Indane LPG Gas Cylinders Refill',
    amount: 3750,
    paymentMethod: 'upi',
    vendorName: 'Sri Murugan Gas Agency',
    paidBy: 'Store Manager',
    createdAt: new Date().toISOString(),
  }
];

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'user-admin',
    username: 'admin',
    name: 'Senthil Nathan (Owner/Admin)',
    email: 'admin@karaikudimess.in',
    role: 'admin',
    phone: '+91 98421 76543',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-cashier',
    username: 'cashier',
    name: 'Murugan (Billing Cashier)',
    email: 'cashier@karaikudimess.in',
    role: 'cashier',
    phone: '+91 97512 34567',
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user-staff',
    username: 'staff',
    name: 'Karthik (Kitchen / Floor Staff)',
    email: 'staff@karaikudimess.in',
    role: 'staff',
    phone: '+91 96234 56789',
    active: true,
    createdAt: new Date().toISOString(),
  }
];
