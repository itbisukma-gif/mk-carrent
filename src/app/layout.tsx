import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google'
import { LanguageProvider } from './language-provider';
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

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
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.variable)}>
        <LanguageProvider>
          <div className="flex flex-col min-h-screen">
            <WebHeader />
            <main className="flex-1">
              {children}
            </main>
            <WebFooter />
          </div>
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}
