import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Space_Grotesk, Inter } from 'next/font/google';
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { LanguageProvider } from './(web)/language-provider';
import { WhatsappFab } from '@/components/whatsapp-fab';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-heading'})


export const metadata: Metadata = {
  title: 'MudaKarya CarRent - Solusi Rental Mobil Terbaik',
  description: 'Penyedia layanan rental mobil terpercaya dengan berbagai pilihan armada dan harga terbaik.',
  icons: [
    {
      rel: 'icon',
      url: '/logo-icon.png',
    },
    {
      rel: 'apple-touch-icon',
      url: '/logo-icon.png',
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased flex flex-col', 
        inter.variable, 
        spaceGrotesk.variable
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
