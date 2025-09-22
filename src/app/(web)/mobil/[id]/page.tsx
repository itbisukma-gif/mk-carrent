
'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { StarRating } from '@/components/star-rating';
import { Textarea } from '@/components/ui/textarea';
import { Users, Cog, Fuel, Calendar as CalendarIconLucide, Car, Shield, Award, ChevronLeft } from 'lucide-react';
import type { Vehicle, Testimonial, GalleryItem } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { OrderForm } from '@/components/order-form';
import { VehicleCard } from '@/components/vehicle-card';
import { useLanguage } from '@/hooks/use-language';
import { Loader2, Star as StarIcon } from "lucide-react"

async function getVehicleData(id: string) {
    const supabase = createClient();
    const { data: vehicle, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();
    
    if (vehicleError) return { vehicle: null, testimonials: [], gallery: [], otherVehicles: [], variants: [] };

    const { data: testimonials, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('vehicleName', `${vehicle.brand} ${vehicle.name}`)
        .order('created_at', { ascending: false });

    const { data: gallery, error: galleryError } = await supabase
        .from('gallery')
        .select('*')
        .eq('vehicleName', `${vehicle.brand} ${vehicle.name}`)
        .order('created_at', { ascending: false });

    const { data: otherVehicles, error: otherVehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .neq('id', id)
        .limit(4);

    const { data: variants, error: variantsError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('brand', vehicle.brand)
        .eq('name', vehicle.name);

    return { 
        vehicle, 
        testimonials: testimonials || [],
        gallery: gallery || [],
        otherVehicles: otherVehicles || [],
        variants: variants || []
    };
}

export default function MobilDetailPage({ params }: { params: { id: string } }) {
    const { dictionary } = useLanguage();
    const [data, setData] = useState<{ vehicle: Vehicle | null; testimonials: Testimonial[]; gallery: GalleryItem[]; otherVehicles: Vehicle[], variants: Vehicle[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const result = await getVehicleData(params.id);
            setData(result);
            setIsLoading(false);
        };
        fetchData();
    }, [params.id]);


    if (isLoading) {
        return <div className="container py-20 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>;
    }

    if (!data || !data.vehicle) {
        return (
            <div className="container text-center py-20">
              <h2 className="text-2xl font-bold">Mobil Tidak Ditemukan</h2>
              <p className="text-muted-foreground">Maaf, mobil yang Anda cari tidak ada.</p>
              <Button asChild className="mt-6">
                <Link href="/"><ChevronLeft className="mr-2 h-4 w-4"/>Kembali ke Home</Link>
              </Button>
            </div>
          );
    }
    
    const { vehicle, testimonials, gallery, otherVehicles, variants } = data;
    
    const formatCurrency = (value: number | null) => {
        if (value === null) return 'N/A';
        return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
    }

    const hasDiscount = vehicle && vehicle.discountPercentage && vehicle.discountPercentage > 0;
    const discountedPrice = (hasDiscount && vehicle?.price && vehicle.discountPercentage)
        ? vehicle.price * (1 - vehicle.discountPercentage / 100)
        : vehicle?.price;

    const averageRating = useMemo(() => {
        if (!testimonials || testimonials.length === 0) return 0;
        const total = testimonials.reduce((acc, t) => acc + t.rating, 0);
        return total / testimonials.length;
    }, [testimonials]);
    
    return (
        <div className="container py-6 md:py-12">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div>
                     <Carousel className="w-full rounded-lg overflow-hidden shadow-lg">
                        <CarouselContent>
                            <CarouselItem>
                                <Image src={vehicle.photo} alt={`${vehicle.brand} ${vehicle.name}`} width={800} height={600} className="w-full aspect-video object-cover" />
                            </CarouselItem>
                             {gallery.map(item => (
                                <CarouselItem key={item.id}>
                                    <Image src={item.url} alt={`Galeri ${vehicle.name}`} width={800} height={600} className="w-full aspect-video object-cover" />
                                </CarouselItem>
                             ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4"/>
                        <CarouselNext className="right-4"/>
                    </Carousel>
                </div>
                <div className="flex flex-col">
                    <div className="flex-grow">
                        <h1 className="text-3xl md:text-4xl font-bold">{vehicle.brand} {vehicle.name}</h1>
                        <div className="flex items-center gap-2 mt-2">
                             <StarRating rating={averageRating} totalReviews={testimonials.length} />
                        </div>
                        <Separator className="my-4" />
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <DetailItem icon={Award} label={dictionary.vehicleDetail.details.brand} value={vehicle.brand} />
                            <DetailItem icon={Car} label={dictionary.vehicleDetail.details.type} value={vehicle.type} />
                            <DetailItem icon={Cog} label={dictionary.vehicleDetail.details.transmission} value={vehicle.transmission} />
                            <DetailItem icon={Fuel} label={dictionary.vehicleDetail.details.fuel} value={vehicle.fuel} />
                            <DetailItem icon={Users} label={dictionary.vehicleDetail.details.capacity} value={`${vehicle.passengers} ${dictionary.vehicleDetail.details.passenger}`} />
                            <DetailItem icon={CalendarIconLucide} label={dictionary.vehicleDetail.details.year} value={vehicle.year} />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t">
                        <p className="text-sm text-muted-foreground">{dictionary.vehicleDetail.pricePerDay}</p>
                         {hasDiscount && discountedPrice ? (
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-primary">{formatCurrency(discountedPrice)}</span>
                                <span className="text-lg text-muted-foreground line-through">{formatCurrency(vehicle.price)}</span>
                            </div>
                        ) : (
                            <p className="text-3xl font-bold text-primary">{formatCurrency(vehicle.price)}</p>
                        )}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button size="lg" className="w-full mt-4">{dictionary.vehicleDetail.bookNow}</Button>
                            </SheetTrigger>
                            <SheetContent className="p-0 flex flex-col">
                               <OrderForm variants={variants} />
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>

            <Separator className="my-12" />

             {/* Testimonials and Gallery */}
            <ReviewSection 
                testimonials={testimonials} 
                gallery={gallery} 
                vehicleName={`${vehicle.brand} ${vehicle.name}`}
                averageRating={averageRating}
            />

            <Separator className="my-12" />

            {/* Other Recommendations */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6 text-center">{dictionary.vehicleDetail.otherRecommendations}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {otherVehicles.map(v => (
                        <VehicleCard key={v.id} vehicle={v} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function DetailItem({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | null }) {
    if (!value) return null;
    return (
        <div className="flex items-center gap-3">
            <Icon className="h-5 w-5 text-primary" />
            <div>
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-medium">{value}</p>
            </div>
        </div>
    );
}


function ReviewSection({ testimonials, gallery, vehicleName, averageRating }: { testimonials: Testimonial[], gallery: GalleryItem[], vehicleName: string, averageRating: number }) {
    const { dictionary } = useLanguage();
    const { toast } = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    
    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        toast({ title: "Ulasan Terkirim", description: "Terima kasih atas ulasan Anda!" });
        setRating(0);
        setComment("");
    }
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-center">{dictionary.vehicleDetail.reviews.customerReviews}</h2>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                <div className="space-y-6">
                    {testimonials.length > 0 ? (
                        testimonials.map(testimonial => (
                            <div key={testimonial.id} className="border-b pb-4">
                                <div className="flex items-center justify-between mb-2">
                                     <h4 className="font-semibold">{testimonial.customerName}</h4>
                                     <StarRating rating={testimonial.rating} />
                                </div>
                                <p className="text-sm text-muted-foreground italic">"{testimonial.comment}"</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">{dictionary.vehicleDetail.reviews.noReviews}</p>
                    )}
                </div>
                 <div className="space-y-6">
                    <h3 className="text-lg font-semibold">{dictionary.vehicleDetail.reviews.writeReview}</h3>
                    <form onSubmit={handleSubmitReview} className="p-4 border rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground mb-3">{dictionary.vehicleDetail.reviews.shareExperience}</p>
                         <div className="flex items-center gap-3 mb-4">
                             <span className="text-sm font-medium">{dictionary.vehicleDetail.reviews.yourRating}</span>
                            <StarRating rating={rating} onRatingChange={setRating} />
                        </div>
                        <Textarea 
                            placeholder={dictionary.vehicleDetail.reviews.commentPlaceholder}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                        <Button type="submit" size="sm" className="mt-4" disabled={rating === 0 || !comment}>
                            {dictionary.vehicleDetail.reviews.submitReview}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
