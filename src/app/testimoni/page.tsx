
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Testimonial, GalleryItem } from '@/lib/types';

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StarRating } from '@/components/star-rating';
import { useLanguage } from '@/hooks/use-language';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';

export const dynamic = 'force-dynamic';

function TestimoniPageContent() {
    const { dictionary } = useLanguage();
    const { toast } = useToast();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
        const supabaseClient = createClient();
        setSupabase(supabaseClient);
    }, []);

    useEffect(() => {
        if (!supabase) return;
        
        const fetchData = async () => {
            setIsLoading(true);
            const { data: testimonialsData, error: testimonialsError } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
            const { data: galleryData, error: galleryError } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });

            if (testimonialsError) toast({ variant: 'destructive', title: 'Gagal memuat testimoni.', description: testimonialsError.message });
            else setTestimonials(testimonialsData || []);

            if (galleryError) toast({ variant: 'destructive', title: 'Gagal memuat galeri.', description: galleryError.message });
            else setGallery(galleryData || []);

            setIsLoading(false);
        };

        fetchData();
    }, [toast, supabase]);

    return (
        <div className="bg-muted/30">
            <div className="container py-8 md:py-16">
                 <div className="text-center mb-12 max-w-2xl mx-auto">
                    <h1 className="text-4xl font-bold tracking-tight">{dictionary.testimonials.title}</h1>
                    <p className="mt-4 text-lg text-muted-foreground">{dictionary.testimonials.description}</p>
                </div>
                
                 <Tabs defaultValue="reviews" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                        <TabsTrigger value="reviews">{dictionary.testimonials.tabs.reviews}</TabsTrigger>
                        <TabsTrigger value="gallery">{dictionary.testimonials.tabs.gallery}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="reviews" className="mt-8">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                             <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                                {testimonials.map((testimonial) => (
                                <Card key={testimonial.id} className="break-inside-avoid shadow-md">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col h-full">
                                            <div className="flex-grow mb-4">
                                                <p className="text-muted-foreground italic">"{testimonial.comment}"</p>
                                            </div>
                                            <div className="border-t pt-4">
                                                <h4 className="font-bold">{testimonial.customerName}</h4>
                                                {testimonial.vehicleName && (
                                                    <p className="text-xs text-muted-foreground">{dictionary.testimonials.rented} {testimonial.vehicleName}</p>
                                                )}
                                                <div className="mt-2">
                                                    <StarRating rating={testimonial.rating} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="gallery" className="mt-8">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>
                        ) : (
                             <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
                                {gallery.map((item) => (
                                <div key={item.id} className="relative group rounded-lg overflow-hidden shadow-lg break-inside-avoid">
                                    <Image
                                        src={item.url}
                                        alt={dictionary.testimonials.galleryAlt}
                                        width={400}
                                        height={400}
                                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                        data-ai-hint="customer car photo"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <p className="text-white text-sm font-semibold">{dictionary.testimonials.galleryHover}</p>
                                    </div>
                                </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default function TestimoniPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <WebHeader />
            <main className="flex-1">
                <TestimoniPageContent />
            </main>
            <WebFooter />
        </div>
    )
}
