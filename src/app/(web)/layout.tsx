
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { WhatsappFab } from '@/components/whatsapp-fab';

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <WebHeader />
      <main className="flex-1">{children}</main>
      <WhatsappFab />
      <WebFooter />
    </>
  );
}
