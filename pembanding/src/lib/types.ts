
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
  carName: string;
  type: string;
  fuel: string;
  transmission: 'Manual' | 'Matic';
  service: string;
  driver: string | null;
  paymentProof: string;
  status: OrderStatus;
  paymentMethod: 'QRIS' | 'Transfer Bank';
};
    
export type ContactInfo = {
    address: string;
    email: string;
    whatsapp: string;
    maps: string;
}

export type TermsContent = {
    general: string;
    payment: string;
}

export type PageProps = {
  params: { [key: string]: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};