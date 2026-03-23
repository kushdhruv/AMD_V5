// ============================================================
// STALL DATA TYPES — Used across all stall module screens
// ============================================================
import { SponsorSlot } from '../../../types/config';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  isVeg: boolean;
  emoji: string;
  isPopular?: boolean;
}

export interface Stall {
  id: string;
  name: string;
  category: 'food' | 'merch' | 'service' | 'sponsor';
  description: string;
  emoji: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  priceRange: string;
  isFeatured: boolean;
  isSponsored: boolean;
  contact: {
    phone: string;
    whatsapp?: string;
    upi?: string;
  };
  location: string;
  timings: string;
  menu: MenuItem[];
}

// ── Demo data — injected in demo_mode ──────────────────────
export const DEMO_STALLS: Stall[] = [
  {
    id: '1',
    name: 'Biryani Junction',
    category: 'food',
    description: 'Authentic Hyderabadi biryani & kebabs. Must try the Dum Biryani!',
    emoji: '🍛',
    tags: ['Non-Veg', 'Spicy', 'Popular'],
    rating: 4.8,
    reviewCount: 124,
    priceRange: '₹80 – ₹250',
    isFeatured: true,
    isSponsored: false,
    contact: { phone: '+91 98765 43210', whatsapp: '+91 98765 43210', upi: 'biryani@ybl' },
    location: 'Gate 2, Row A — Stall 4',
    timings: '10:00 AM – 10:00 PM',
    menu: [
      { id: 'm1', name: 'Chicken Biryani', price: 180, description: 'Slow-cooked Dum Biryani', isVeg: false, emoji: '🍗', isPopular: true },
      { id: 'm2', name: 'Veg Pulao', price: 120, description: 'Basmati rice with garden veggies', isVeg: true, emoji: '🌿' },
      { id: 'm3', name: 'Seekh Kebab (6pcs)', price: 140, description: 'Charcoal-grilled minced lamb', isVeg: false, emoji: '🥩' },
      { id: 'm4', name: 'Raita', price: 40, description: 'Cool yoghurt dip', isVeg: true, emoji: '🥛' },
    ],
  },
  {
    id: '2',
    name: 'Chai & Snacks Corner',
    category: 'food',
    description: 'Perfect chai, samosas, and light bites. Your pit-stop between sessions.',
    emoji: '☕',
    tags: ['Veg', 'Quick Bites', 'Must Try'],
    rating: 4.5,
    reviewCount: 88,
    priceRange: '₹20 – ₹80',
    isFeatured: false,
    isSponsored: false,
    contact: { phone: '+91 91234 56789', upi: 'snacks@okaxis' },
    location: 'Central Lawn — Stall 9',
    timings: '8:00 AM – 8:00 PM',
    menu: [
      { id: 'm5', name: 'Masala Chai', price: 20, description: 'Ginger & cardamom tea', isVeg: true, emoji: '☕', isPopular: true },
      { id: 'm6', name: 'Samosa (2pcs)', price: 30, description: 'Crispy potato samosas', isVeg: true, emoji: '🫔' },
      { id: 'm7', name: 'Vada Pav', price: 25, description: 'Mumbai street classic', isVeg: true, emoji: '🍔' },
    ],
  },
  {
    id: '3',
    name: 'TechFest Merch Store',
    category: 'merch',
    description: 'Official event merchandise. Limited edition hoodies, tees, and stickers.',
    emoji: '👕',
    tags: ['Official', 'Limited Edition'],
    rating: 4.6,
    reviewCount: 47,
    priceRange: '₹199 – ₹999',
    isFeatured: true,
    isSponsored: true,
    contact: { phone: '+91 80000 12345', upi: 'merch@ybl' },
    location: 'Main Entrance — Stall 1',
    timings: '9:00 AM – 9:00 PM',
    menu: [
      { id: 'm8', name: 'Event Hoodie', price: 799, description: 'Unisex 300 GSM fleece hoodie', isVeg: true, emoji: '🧥', isPopular: true },
      { id: 'm9', name: 'Event T-Shirt', price: 399, description: 'Combed cotton, limited sizes', isVeg: true, emoji: '👕' },
      { id: 'm10', name: 'Sticker Pack', price: 199, description: '10 premium vinyl stickers', isVeg: true, emoji: '🏷️' },
    ],
  },
];
