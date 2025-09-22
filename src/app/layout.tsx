import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Space_Grotesk, Inter } from 'next/font/google'
import { LanguageProvider } from './language-provider';
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
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
  // This combines the root layout and the web layout to avoid conflicts.
  // The admin layout is separate in its own directory.
  if (typeof children === 'object' && children && 'props' in children) {
    const props = children.props as any;
    if (props?.childProp?.segment === '__PAGE__') {
       // This is a regular web page, wrap with web header/footer
       return (
         <html lang="en" suppressHydrationWarning>
           <head />
           <body className={cn(
             'min-h-screen bg-background font-sans antialiased', 
             inter.variable, 
             spaceGrotesk.variable
           )}>
             <LanguageProvider>
                <WebHeader />
                <main className="flex-1">
                    {children}
                </main>
                <WhatsappFab />
                <WebFooter />
             </LanguageProvider>
             <Toaster />
           </body>
         </html>
       );
    }
  }

  // This handles layouts for special routes like /admin, /login, etc.
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn(
        'min-h-screen bg-background font-sans antialiased', 
        inter.variable, 
        spaceGrotesk.variable
      )}>
        <LanguageProvider>
            {children}
        </LanguageProvider>
        <Toaster />
      </body>
    </html>
  );
}