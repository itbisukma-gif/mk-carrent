
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import type { ContactInfo } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { WhatsAppIcon } from './icons';
import { supabase } from '@/lib/supabase';

export function WhatsappFab() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const { dictionary } = useLanguage();

  useEffect(() => {
    const fetchContactInfo = async () => {
        const { data } = await supabase.from('contact_info').select('*').single();
        setContactInfo(data);
    };
    fetchContactInfo();
  }, []);

  if (!contactInfo || !contactInfo.whatsapp) {
    return null;
  }

  const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
            <Button
              size="icon"
              className={cn(
                "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-green-500 hover:bg-green-600 text-white",
                "md:bottom-6 mb-16 md:mb-0" 
              )}
              aria-label={dictionary.contact.contactWhatsApp}
            >
              <WhatsAppIcon className="h-7 w-7" />
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-foreground text-background">
          <p>{dictionary.contact.contactWhatsApp}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

    