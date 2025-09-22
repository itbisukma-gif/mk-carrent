
'use client'

import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import HomePageContent from './home-content';


export default function WebLayout() {
  return (
      <div className="flex flex-col min-h-screen">
        <WebHeader />
        <main className="flex-1">
          <HomePageContent />
        </main>
        <WebFooter />
      </div>
  );
}
