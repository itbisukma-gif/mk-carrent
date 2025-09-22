'use client';

import { Suspense } from 'react';
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import ConfirmationPageContent from '@/app/konfirmasi/content';

export default function PembayaranPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <WebHeader />
            <main className="flex-1">
                <Suspense fallback={<div className="flex items-center justify-center h-screen"><p>Loading...</p></div>}>
                    <ConfirmationPageContent />
                </Suspense>
            </main>
            <WebFooter />
      </div>
    )
}
