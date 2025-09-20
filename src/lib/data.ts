

import type { BankAccount, Promotion } from './types';
import logos from './logo-urls.json';

// This file contains dummy data for demonstration purposes.
// In a real application, this data would be fetched from a database or API.

export let serviceCosts = {
    driver: 150000,
    matic: 50000,
    fuel: 200000,
};

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
      vehicleId: 'v-003', // This will need to be updated with a real UUID
    },
    {
      id: 'promo-2',
      title: 'Sewa Mingguan Lebih Hemat',
      description: 'Dapatkan harga khusus untuk penyewaan mobil selama 7 hari atau lebih. Hubungi kami untuk info lebih lanjut.',
      imageUrl: 'https://picsum.photos/seed/promo2/1280/720',
    }
];

// Most static data has been migrated to Supabase.
// These can be removed if they are no longer needed for any fallback.
export let orders = [];
export let fleet = [];
export let testimonials = [];
export let gallery = [];
export let features = [];
