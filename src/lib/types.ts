

export type Driver = {
  id: string;
  created_at?: string;
  name: string;
  address: string | null;
  phone: string | null;
  status: 'Tersedia' | 'Bertugas';
}

export type Vehicle = {
  id: string;
  created_at?: string;
  name: string | null;
  brand: string | null;
  type: string | null;
  passengers: number | null;
  transmission: 'Manual' | 'Matic' | null;
  price: number | null;
  fuel: string | null;
  code: string | null;
  year: number | null;
  rating: number | null;
  dataAiHint: string | null;
  discountPercentage: number | null;
  photo: string | null;
  unitType: 'biasa' | 'khusus' | null;
  stock: number | null;
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
  customerName: string | null;
  customerPhone: string | null;
  carName: string | null;
  type: string | null;
  fuel: string | null;
  transmission: 'Manual' | 'Matic' | null;
  service: string | null;
  driver: string | null;
  paymentProof: string | null;
  status: OrderStatus | null;
  paymentMethod: 'QRIS' | 'Transfer Bank' | null;
  total: number | null;
  createdAt: string; // ISO 8601 date string
  driverId?: string | null;
  vehicleId?: string | null;
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
