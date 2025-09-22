

import type { Driver, Vehicle, Testimonial, Order, GalleryItem, BankAccount } from './types';
import logos from './logo-urls.json';

// This file contains dummy data for demonstration purposes.
// In a real application, this data would be fetched from a database or API.

// revenueData can remain as it's for a static chart example.
export const revenueData = [
  { date: 'Mon', revenue: 2100000 },
  { date: 'Tue', revenue: 2500000 },
  { date: 'Wed', revenue: 1800000 },
  { date: 'Thu', revenue: 3200000 },
  { date: 'Fri', revenue: 4100000 },
  { date: 'Sat', revenue: 5300000 },
  { date: 'Sun', revenue: 4800000 },
];

// Empty arrays ready for real data
export const drivers: Driver[] = [];

export const fleet: Vehicle[] = [];

export const orders: Order[] = [];

export const testimonials: Testimonial[] = [];

export const gallery: GalleryItem[] = [];

export const bankAccounts: BankAccount[] = [];
