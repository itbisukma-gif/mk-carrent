

export type Driver = {
  id: string
  name: string
  address: string
  phone: string
  status: 'Tersedia' | 'Bertugas'
}

export type Vehicle = {
  id: string
  photo: string
  name: string
  brand: string
  type: string
  passengers: number
  transmission: 'Manual' | 'Matic'
  price: number
  fuel: string
  code: string
  year: number
  rating: number
  dataAiHint: string
  discountPercentage?: number
  carName?: string
  unitType?: 'biasa' | 'khusus';
  stock?: number;
}

export type Testimonial = {
  id: string;
  customerName: string;
  vehicleName: string;
  rating: number;
  comment: string;
}

export type GalleryItem = {
    id: string;
    url: string;
    vehicleName?: string;
}

export type FeatureItem = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    dataAiHint: string;
}

export type BankAccount = {
    bankName: string;
    accountNumber: string;
    accountName: string;
    logoUrl: string;
}

export type OrderStatus = 'pending' | 'disetujui' | 'tidak disetujui' | 'selesai';

export type Order = {
  id: string;
  customerName: string;
  customerPhone: string;
  carName: string;
  type: string;
  fuel: string;
  transmission: 'Manual' | 'Matic';
  service: string;
  driver: string | null;
  paymentProof: string;
  status: OrderStatus;
  paymentMethod: 'QRIS' | 'Transfer Bank';
  total: number;
  createdAt: string; // ISO 8601 date string
  driverId?: string | null;
};
    
export type ContactInfo = {
    address: string;
    email: string;
    whatsapp: string;
    maps: string;
    instagram?: string;
    facebook?: string;
    twitter?: string;
    tiktok?: string;
    telegram?: string;
}

export type TermsContent = {
    general: string;
    payment: string;
}

export type Promotion = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    vehicleId?: string;
};

    