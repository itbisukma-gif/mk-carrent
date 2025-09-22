
'use client';

import { Suspense } from 'react';
import { InvoicePageContent } from './content';

export default function InvoicePage({ params }: { params: { id: string } }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <InvoicePageContent orderId={params.id} />
        </Suspense>
    )
}

    