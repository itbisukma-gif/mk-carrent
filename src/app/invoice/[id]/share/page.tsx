
'use client';

import { Suspense } from 'react';
import { InvoicePageContent } from '../content';

export default function SharedInvoicePage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvoicePageContent orderId={params.id} isShared={true} />
        </Suspense>
    )
}
