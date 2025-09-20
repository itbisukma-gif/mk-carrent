

import type { Driver, Vehicle, Testimonial, Order, GalleryItem, BankAccount, Promotion, FeatureItem } from './types';
import logos from './logo-urls.json';

// This file contains dummy data for demonstration purposes.
// In a real application, this data would be fetched from a database or API.

export let serviceCosts = {
    driver: 150000,
    matic: 50000,
    fuel: 200000,
};

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

export let testimonials: Testimonial[] = [
    {
        id: 'test-1',
        customerName: 'Siti Aminah',
        vehicleName: 'Toyota Avanza',
        rating: 5,
        comment: 'Pelayanannya ramah dan mobilnya bersih. Sangat direkomendasikan!'
    },
    {
        id: 'test-2',
        customerName: 'Rudi Hartono',
        vehicleName: 'Honda Brio',
        rating: 4,
        comment: 'Proses sewa cepat dan mudah. Mobilnya irit banget.'
    }
];

export let gallery: GalleryItem[] = [
    { id: 'gal-1', url: 'https://picsum.photos/seed/gallery1/400/400', vehicleName: 'Toyota Avanza' },
    { id: 'gal-2', url: 'https://picsum.photos/seed/gallery2/400/400' },
    { id: 'gal-3', url: 'https://picsum.photos/seed/gallery3/400/400', vehicleName: 'Mitsubishi Xpander' },
    { id: 'gal-4', url: 'https://picsum.photos/seed/gallery4/400/400', vehicleName: 'Toyota Avanza' },
];

export let features: FeatureItem[] = [
    {
        id: 'feat-1',
        title: 'Unit Selalu Bersih',
        description: 'Setiap mobil kami cuci dan disinfeksi secara menyeluruh sebelum disewakan untuk kenyamanan Anda.',
        imageUrl: 'https://picsum.photos/seed/feature1/600/400',
        dataAiHint: 'car cleaning',
    },
    {
        id: 'feat-2',
        title: 'Kondisi Mobil Terjaga',
        description: 'Kami melakukan servis rutin untuk memastikan setiap kendaraan dalam kondisi prima dan aman untuk perjalanan Anda.',
        imageUrl: 'https://picsum.photos/seed/feature2/600/400',
        dataAiHint: 'car maintenance',
    },
    {
        id: 'feat-3',
        title: 'Driver Berpengalaman',
        description: 'Supir kami tidak hanya ahli mengemudi, tetapi juga ramah dan memahami rute-rute terbaik untuk Anda.',
        imageUrl: 'https://picsum.photos/seed/feature3/600/400',
        dataAiHint: 'professional driver',
    }
];


export let bankAccounts: BankAccount[] = [
    { 
        bankName: 'BCA', 
        accountNumber: '1234567890', 
        accountName: 'PT MudaKarya',
        logoUrl: logos['bca']
    },
    { 
        bankName: 'Mandiri', 
        accountNumber: '0987654321', 
        accountName: 'PT MudaKarya',
        logoUrl: logos['mandiri']
    },
];

export let promotions: Promotion[] = [
    {
      id: 'promo-1',
      title: 'Promo Liburan Akhir Tahun',
      description: 'Nikmati diskon spesial 20% untuk semua jenis mobil selama periode liburan. Pesan sekarang!',
      imageUrl: 'https://picsum.photos/seed/promo1/1280/720',
      vehicleId: 'v-003', // Promo for Mitsubishi Xpander
    },
    {
      id: 'promo-2',
      title: 'Sewa Mingguan Lebih Hemat',
      description: 'Dapatkan harga khusus untuk penyewaan mobil selama 7 hari atau lebih. Hubungi kami untuk info lebih lanjut.',
      imageUrl: 'https://picsum.photos/seed/promo2/1280/720',
    }
];

// Dummy data for fleet, orders, drivers is now fetched from Supabase, so this can be removed or emptied.
export let fleet: Vehicle[] = [];
export let orders: Order[] = [];
export let drivers: Driver[] = [];
