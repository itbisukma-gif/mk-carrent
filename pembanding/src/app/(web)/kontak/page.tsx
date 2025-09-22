
'use client';

import { Button } from "@/components/ui/button";
import { Mail, Phone, Pin, Navigation } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LanguageProvider } from "@/app/language-provider";
import { useState, useEffect } from "react";
import type { ContactInfo } from "@/lib/types";

function KontakPageContent() {
    const { dictionary } = useLanguage();
    // In a real app, this would be fetched from a database.
    // For now, we simulate fetching it and storing it in state.
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);

    useEffect(() => {
        // Simulating fetch from a config source (which would be updated by the admin)
        const fetchedContactInfo = {
            address: "Jl. Raya Kuta No. 123, Badung, Bali",
            email: "contact@autorent.com",
            whatsapp: "+62 812 3456 7890",
            maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31552.316868673754!2d115.15024474999999!3d-8.723613499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd246bc2a594833%3A0x24443a99872e4242!2sKuta%2C%20Badung%20Regency%2C%20Bali%2C%20Indonesia!5e0!3m2!1sen!2sus!4v1722421343751!5m2!1sen!2sus"
        };
        setContactInfo(fetchedContactInfo);
    }, []);

    if (!contactInfo) {
        return <div className="container py-16 text-center">{dictionary.loading}...</div>
    }

    return (
            <div className="container py-8 md:py-16">
                 <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h1 className="text-4xl font-bold tracking-tight">{dictionary.contact.title}</h1>
                    <p className="mt-4 text-lg text-muted-foreground">{dictionary.contact.description}</p>
                </div>

                <div className="max-w-4xl mx-auto">

                    {/* Google Maps */}
                    <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg">
                        <iframe
                            src={contactInfo.maps}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={dictionary.contact.mapTitle}
                        ></iframe>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-8 justify-center mb-8">
                         <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer">
                            <Button size="lg">
                                <Navigation className="mr-2 h-4 w-4" />
                                {dictionary.contact.getDirections}
                            </Button>
                        </a>
                         <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="lg">
                                 <Phone className="mr-2 h-4 w-4" />
                                {dictionary.contact.contactWhatsApp}
                            </Button>
                        </a>
                    </div>
                    
                    {/* Simplified Contact Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center pt-8 border-t">
                        <div className="flex flex-col items-center gap-2">
                            <Pin className="h-10 w-10 text-primary" />
                            <h3 className="font-semibold text-lg">{dictionary.contact.officeAddress}</h3>
                            <p className="text-muted-foreground text-sm">{contactInfo.address}</p>
                        </div>
                         <div className="flex flex-col items-center gap-2">
                            <Mail className="h-10 w-10 text-primary" />
                            <h3 className="font-semibold text-lg">{dictionary.contact.email}</h3>
                             <a href={`mailto:${contactInfo.email}`} className="text-muted-foreground text-sm hover:text-primary">{contactInfo.email}</a>
                        </div>
                         <div className="flex flex-col items-center gap-2">
                            <Phone className="h-10 w-10 text-primary" />
                            <h3 className="font-semibold text-lg">{dictionary.contact.whatsApp}</h3>
                            <a href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-sm hover:text-primary">{contactInfo.whatsapp}</a>
                        </div>
                    </div>
                </div>
            </div>
    )
}

export default function KontakPage() {
    return (
        <LanguageProvider>
            <KontakPageContent />
        </LanguageProvider>
    )
}
