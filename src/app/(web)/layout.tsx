import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { LanguageProvider } from '../language-provider';
import { WhatsappFab } from '@/components/whatsapp-fab';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <WebHeader />
        <main className="flex-1">
            {children}
        </main>
      <WhatsappFab />
      <WebFooter />
    </LanguageProvider>
  );
}