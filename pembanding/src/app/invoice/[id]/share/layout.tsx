
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { LanguageProvider } from '@/app/language-provider';

export default function SharedInvoiceWebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <main id="printable-area">
        <WebHeader />
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 flex items-center justify-center bg-muted/40 p-4">
                {children}
            </main>
        </div>
        <WebFooter />
      </main>
    </LanguageProvider>
  );
}
