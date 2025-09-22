
'use client';

import AdminLayout from '@/app/admin/layout';

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
