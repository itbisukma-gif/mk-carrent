
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WhatsAppIcon } from '@/components/icons';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';
import { LanguageProvider } from '@/app/language-provider';

async function getContactInfo() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();
    
    if (error || !data) {
        // Instead of notFound(), return null or a default object
        // to prevent build failure if the table is empty.
        return null;
    }
    return data;
}


export default async function ContactPage() {
    const contactInfo = await getContactInfo();
    const dict = dictionaries['id'].contact; // using 'id' for now
    
    if (!contactInfo) {
        return (
            <LanguageProvider>
                 <div className="flex flex-col min-h-screen">
                    <WebHeader />
                    <main className="flex-1 bg-muted/30 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Informasi Kontak Tidak Tersedia</h1>
                            <p className="text-muted-foreground">Data kontak sedang tidak dapat dimuat saat ini.</p>
                        </div>
                    </main>
                    <WebFooter />
                </div>
            </LanguageProvider>
        )
    }

    const whatsappUrl = `https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`;

    return (
        <LanguageProvider>
            <div className="flex flex-col min-h-screen">
                <WebHeader />
                <main className="flex-1 bg-muted/30">
                    <div className="container py-8 md:py-16">
                        <div className="text-center mb-12 max-w-2xl mx-auto">
                            <h1 className="text-4xl font-bold tracking-tight">{dict.title}</h1>
                            <p className="mt-4 text-lg text-muted-foreground">{dict.description}</p>
                        </div>

                        <div className="grid md:grid-cols-5 gap-8">
                            {/* Map Section */}
                            <div className="md:col-span-3">
                                <Card className="overflow-hidden">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <MapPin className="h-5 w-5 text-primary"/>
                                            {dict.mapTitle}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {contactInfo.maps && (
                                            <div className="aspect-video w-full rounded-lg overflow-hidden border">
                                                <iframe
                                                    src={contactInfo.maps}
                                                    width="100%"
                                                    height="100%"
                                                    style={{ border: 0 }}
                                                    allowFullScreen={true}
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                ></iframe>
                                            </div>
                                        )}
                                        <Button asChild className="mt-4 w-full">
                                            <a href={`https://www.google.com/maps?q=${encodeURIComponent(contactInfo.address)}`} target="_blank" rel="noopener noreferrer">
                                                {dict.getDirections} <ExternalLink className="ml-2 h-4 w-4"/>
                                            </a>
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Contact Info Section */}
                            <div className="md:col-span-2">
                                 <Card>
                                    <CardContent className="p-6 space-y-6">
                                         <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2"><MapPin className="h-5 w-5"/> {dict.officeAddress}</h3>
                                            <p className="text-muted-foreground mt-1">{contactInfo.address}</p>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2"><Mail className="h-5 w-5"/> {dict.email}</h3>
                                            <a href={`mailto:${contactInfo.email}`} className="text-muted-foreground hover:text-primary transition-colors">{contactInfo.email}</a>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg flex items-center gap-2"><Phone className="h-5 w-5"/> {dict.phone} / {dict.contactWhatsApp}</h3>
                                            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">{contactInfo.whatsapp}</a>
                                        </div>
                                        
                                         <Button asChild className="w-full bg-green-500 hover:bg-green-600">
                                             <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                                <WhatsAppIcon className="mr-2 h-5 w-5"/> {dict.contactWhatsApp}
                                            </a>
                                         </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </main>
                <WebFooter />
            </div>
        </LanguageProvider>
    )
}

    