
import { ReactNode } from 'react';

export default function InvoiceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-center bg-muted/40 p-4 min-h-screen">
        {children}
    </div>
  );
}
