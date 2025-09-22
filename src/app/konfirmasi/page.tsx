'use client';

import { Suspense } from 'react';
import ConfirmationPageContent from './content';

export const dynamic = 'force-dynamic';

export default function KonfirmasiPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen"><p>Loading confirmation...</p></div>}>
            <ConfirmationPageContent />
        </Suspense>
    )
}
