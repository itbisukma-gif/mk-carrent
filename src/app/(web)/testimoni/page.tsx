'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import type { Testimonial, GalleryItem, Vehicle } from '@/lib/types';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageSquareQuote } from 'lucide-react';
import { StarRating } from '@/components/star-rating';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';


export const dynamic = 'force-dynamic';

function ReviewCard({ review }: { review: Testimonial }) {
  const { dictionary } = useLanguage();
  return (
    Card className="break-inside-avoid">
        CardHeader>
            div className="flex items-start justify-between">
                div>
                    <CardTitle className="text-base font-bold">{review.customerName}CardTitle>
                    {review.vehicleName && <CardDescription>{dictionary.testimonials.rented} {review.vehicleName}CardDescription>}
                div>
                div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                    <Star className="h-4 w-4 fill-current"/>
                    span>{review.rating.toFixed(1)}span>
                div>
            div>
        CardHeader>
        {review.comment && (
            CardContent>
                blockquote className="italic text-muted-foreground">"{review.comment}"blockquote>
            CardContent>
        )}
    Card>
  )
}

function Testimonials() {
    const { dictionary } = useLanguage();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    useEffect(() => {
      const supabaseClient = createClient();
      setSupabase(supabaseClient);
    }, []);

    useEffect(() => {
        if (!supabase) return;
        const fetchTestimonials = async () => {
            const { data: testimonialsData } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
            const { data: vehiclesData } = await supabase.from('vehicles').select('name, brand');
            if (testimonialsData) setTestimonials(testimonialsData);
            if (vehiclesData) setVehicles(vehiclesData);
        };
        fetchTestimonials();
    }, [supabase]);

    const vehicleOptions = useMemo(() => {
        return ['all', ...vehicles.map(v => `${v.brand} ${v.name}`)];
    }, [vehicles]);

    const [filter, setFilter] = useState('all');

    const filteredTestimonials = useMemo(() => {
        if (filter === 'all') return testimonials;
        return testimonials.filter(t => t.vehicleName === filter);
    }, [testimonials, filter]);

    return (
        div className="space-y-8">
            div className="flex items-center justify-between">
                div className="relative">
                    <MessageSquareQuote className="absolute -left-4 -top-4 h-12 w-12 text-primary/10" />
                    <h2 className="text-3xl font-bold tracking-tight">{dictionary.testimonials.title}h2>
                    <p className="mt-2 text-muted-foreground max-w-2xl">{dictionary.testimonials.description}p>
                div>
            div>

            {/* Masonry-style layout for reviews */}
            div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {filteredTestimonials.length > 0 ? (
                    filteredTestimonials.map(review => <ReviewCard key={review.id} review={review} />)
                ) : (
                    p className="col-span-full text-center text-muted-foreground">Tidak ada testimoni untuk ditampilkan.p>
                )}
            div>
        div>
    );
}

function Gallery() {
    const { dictionary } = useLanguage();
    const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    useEffect(() => {
        const supabaseClient = createClient();
        setSupabase(supabaseClient);
    }, []);

    useEffect(() => {
      if (!supabase) return;
      const fetchGallery = async () => {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (data) setGalleryItems(data);
      }
      fetchGallery();
    }, [supabase]);

    return (
         div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-4 space-y-4">
            {galleryItems.map(item => (
                div key={item.id} className="break-inside-avoid relative group overflow-hidden rounded-lg shadow-md">
                    <Image
                        src={item.url}
                        alt={dictionary.testimonials.galleryAlt}
                        width={400}
                        height={400}
                        className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                        data-ai-hint="customer photo"
                    />
                    div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <p className="text-white text-sm font-medium">{item.vehicleName || dictionary.testimonials.galleryHover}p>
                    div>
                div>
            ))}
        div>
    )
}

export default function TestimoniPage() {
    const { dictionary } = useLanguage();
    return (
        div className="container py-12 md:py-16">
            Tabs defaultValue="reviews" className="w-full">
                TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-10">
                    TabsTrigger value="reviews">{dictionary.testimonials.tabs.reviews}TabsTrigger>
                    TabsTrigger value="gallery">{dictionary.testimonials.tabs.gallery}TabsTrigger>
                TabsList>
                TabsContent value="reviews">
                    <Testimonials />
                TabsContent>
                TabsContent value="gallery">
                    <Gallery />
                TabsContent>
            Tabs>
        div>
    )
}
