

import type { Driver, Vehicle, Testimonial, Order, GalleryItem, BankAccount, Promotion, FeatureItem } from './types';
import logos from './logo-urls.json';

// This file contains dummy data for demonstration purposes.
// In a real application, this data would be fetched from a database or API.

export let serviceCosts = {
    driver: 150000,
    matic: 50000,
    fuel: 200000,
};

// New centralized calculation function
export const calculateInvoiceDetails = (order: Order) => {
    // This function will need to be adapted to fetch vehicle data from Supabase as well
    // For now, we'll leave it as a placeholder.
    const vehicle = undefined; // Placeholder for now
    
    // Default values in case vehicle is not found
    if (!vehicle) {
        return { 
            total: order.total, 
            rentalCost: order.total, 
            mFee: 0, 
            dFee: 0, 
            fuelFee: 0,
            discAmount: 0, 
            days: 1 
        };
    }
    
    // Assuming duration is 1 day for simplicity in invoices for now.
    // A more robust implementation would store the duration in the order object.
    const days = 1;

    const rentalCost = vehicle.price * days;
    const mFee = vehicle.transmission === 'Matic' ? serviceCosts.matic * days : 0;
    const dFee = order.service.toLowerCase().includes('supir') ? serviceCosts.driver * days : 0;
    const fuelFee = order.service.toLowerCase().includes('all-include') ? serviceCosts.fuel * days : 0;

    const subtotal = rentalCost + mFee + dFee + fuelFee;
    
    const discAmount = vehicle.discountPercentage 
        ? (rentalCost * vehicle.discountPercentage) / 100
        : 0;

    const total = subtotal - discAmount;
    return { total, rentalCost, mFee, dFee, fuelFee, discAmount, days };
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

export let drivers: Driver[] = [
    {
      id: "d-001",
      name: "Budi Santoso",
      address: "Jl. Merdeka No. 10, Jakarta",
      phone: "081234567890",
      status: 'Tersedia'
    },
    {
      id: "d-002",
      name: "Agus Setiawan",
      address: "Jl. Mawar No. 5, Bandung",
      phone: "082198765432",
      status: 'Tersedia'
    },
];

export let orders: Order[] = [
    {
        id: 'ORD-12345',
        customerName: 'Ahmad Subarjo',
        customerPhone: '081234567890',
        carName: 'Toyota Avanza',
        type: 'MPV',
        fuel: 'Bensin',
        transmission: 'Manual',
        service: 'Dengan Supir',
        driver: 'Budi Santoso',
        driverId: 'd-001',
        paymentProof: 'https://picsum.photos/seed/proof1/400/300',
        status: 'disetujui',
        paymentMethod: 'Transfer Bank',
        total: 500000,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    },
    {
        id: 'ORD-54321',
        customerName: 'Citra Lestari',
        customerPhone: '089876543210',
        carName: 'Honda Brio',
        type: 'City Car',
        fuel: 'Bensin',
        transmission: 'Matic',
        service: 'Lepas Kunci',
        driver: null,
        driverId: null,
        paymentProof: 'https://picsum.photos/seed/proof2/400/300',
        status: 'pending',
        paymentMethod: 'QRIS',
        total: 350000,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    },
    {
        id: 'ORD-98765',
        customerName: 'Bambang Pamungkas',
        customerPhone: '081122334455',
        carName: 'Mitsubishi Xpander',
        type: 'MPV',
        fuel: 'Bensin',
        transmission: 'Matic',
        service: 'All Include',
        driver: null,
        driverId: null,
        paymentProof: 'https://picsum.photos/seed/proof3/400/300',
        status: 'pending',
        paymentMethod: 'Transfer Bank',
        total: 600000,
        createdAt: new Date().toISOString(), // Now
    },
     {
        id: 'ORD-11223',
        customerName: 'Dewi Ayu',
        customerPhone: '085566778899',
        carName: 'Toyota Innova',
        type: 'MPV',
        fuel: 'Diesel',
        transmission: 'Matic',
        service: 'Dengan Supir',
        driver: 'Agus Setiawan',
        driverId: 'd-002',
        paymentProof: 'https://picsum.photos/seed/proof4/400/300',
        status: 'selesai',
        paymentMethod: 'QRIS',
        total: 700000,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
     {
        id: 'ORD-ABCDE',
        customerName: 'Eko Yulianto',
        customerPhone: '081212121212',
        carName: 'Toyota Avanza',
        type: 'MPV',
        fuel: 'Bensin',
        transmission: 'Manual',
        service: 'Dengan Supir',
        driver: 'Budi Santoso',
        driverId: 'd-001',
        paymentProof: 'https://picsum.photos/seed/proof5/400/300',
        status: 'disetujui',
        paymentMethod: 'QRIS',
        total: 500000,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
    {
        id: 'ORD-FGHIJ',
        customerName: 'Fajar Alfian',
        customerPhone: '081313131313',
        carName: 'Daihatsu Terios',
        type: 'SUV',
        fuel: 'Bensin',
        transmission: 'Manual',
        service: 'Lepas Kunci',
        driver: null,
        driverId: null,
        paymentProof: 'https://picsum.photos/seed/proof6/400/300',
        status: 'pending',
        paymentMethod: 'Transfer Bank',
        total: 380000,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    },
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