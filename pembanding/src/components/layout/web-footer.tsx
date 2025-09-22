
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import type { ContactInfo } from '@/lib/types';


export function WebFooter({ className }: { className?: string }) {
  const pathname = usePathname();
  const { dictionary } = useLanguage();
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

  useEffect(() => {
    // This simulates fetching the contact info from a shared source
    // In a real app, this would come from a global state/context or an API call
    const fetchedContactInfo = {
        address: "Jl. Raya Kuta No. 123, Badung, Bali",
        email: "contact@autorent.com",
        whatsapp: "+62 812 3456 7890",
        maps: "https://www.google.com/maps/embed?pb=..." // Not used here
    };
    setContactInfo(fetchedContactInfo);
  }, []);

  return (
    <div className={className}>
      {/* Mobile Sticky Nav */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-sm md:hidden">
        <nav className="container flex h-16 items-center justify-around">
          {dictionary.navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 text-xs font-medium transition-colors",
                pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </footer>
      {/* Add padding to the bottom of the main content on mobile to prevent overlap */}
      <div className="pb-16 md:pb-0"></div>


      {/* Desktop Footer */}
      <footer className="hidden border-t bg-muted md:block">
        <div className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                  <Logo width={28} height={28} />
                  <span className="text-lg font-bold tracking-tight">AutoRent</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                  {dictionary.footer.description}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{dictionary.footer.navigation}</h4>
              <ul className="space-y-2 text-sm">
                {dictionary.footer.navLinks.map(link => (
                    <li key={link.href}><Link href={link.href} className="text-muted-foreground hover:text-primary">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{dictionary.footer.contactUs}</h4>
              {contactInfo ? (
                <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>{contactInfo.address}</li>
                    <li>Email: {contactInfo.email}</li>
                    <li>WhatsApp: {contactInfo.whatsapp}</li>
                </ul>
              ) : (
                 <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>{dictionary.loading}...</li>
                 </ul>
              )}
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-sm text-muted-foreground">
              {dictionary.footer.copyright(new Date().getFullYear())}
          </div>
        </div>
      </footer>
    </div>
  );
}
