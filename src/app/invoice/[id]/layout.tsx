
// This file can be a simple pass-through layout for the server-side rendered invoice.
// The main layout styling for the shared invoice is in its own layout file.

import { AdminLayout } from '@/app/admin/layout';

export default function InvoiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminLayout>
        <div className="flex items-center justify-center bg-muted/40 p-4">
            {children}
        </div>
    </AdminLayout>
  );
}

    