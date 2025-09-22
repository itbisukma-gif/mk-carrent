import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { LanguageProvider } from '../language-provider';

export default function WebLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
        <div className="flex flex-col min-h-screen">
            <WebHeader />
            <main className="flex-1">
                {children}
            </main>
            <WebFooter />
        </div>
    </LanguageProvider>
  );
}
