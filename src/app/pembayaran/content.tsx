
'use client';

import { Suspense } from 'react';
import { ConfirmationPageContent } from '@/app/konfirmasi/content';

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmationPageContent />
    </Suspense>
  );
}
