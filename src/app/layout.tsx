
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const favicon = `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🚗</text></svg>`;

export const metadata: Metadata = {
  title: 'MudaKarya CarRent - Solusi Rental Mobil Terbaik',
  description: 'Penyedia layanan rental mobil terpercaya dengan berbagai pilihan armada dan harga terbaik.',
  icons: [{ rel: 'icon', url: favicon }],
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
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            {children}
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
