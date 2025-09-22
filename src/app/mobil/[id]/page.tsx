
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Car, Cog, Fuel, Users, Star, MessageSquareQuote, Calendar as CalendarIcon } from 'lucide-react';
import { StarRating } from '@/components/star-rating';
import { OrderForm } from '@/components/order-form';
import { VehicleCard } from '@/components/vehicle-card';

import { useLanguage } from '@/hooks/use-language';
import { useVehicleLogo } from '@/hooks/use-vehicle-logo';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Vehicle, Testimonial, GalleryItem } from '@/lib/types';
import { Loader2 } from 'lucide-react';

function VehicleDetailContent() {
    const { id: vehicleId } = useParams();
    const { dictionary } = useLanguage();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [variants, setVariants] = useState<Vehicle[]>([]);
    const [recommendations, setRecommendations] = useState<Vehicle[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const supabaseClient = createClient();
        setSupabase(supabaseClient);
    }, []);

    useEffect(() => {
        if (!supabase || !vehicleId) return;

        const fetchData = async () => {
            setIsLoading(true);

            // Fetch the main vehicle
            const { data: mainVehicleData, error: mainVehicleError } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', vehicleId)
                .single();

            if (mainVehicleError || !mainVehicleData) {
                notFound();
                return;
            }

            setVehicle(mainVehicleData);

            // Fetch variants (same brand and name)
            const { data: variantsData } = await supabase
                .from('vehicles')
                .select('*')
                .eq('brand', mainVehicleData.brand)
                .eq('name', mainVehicleData.name);
            
            setVariants(variantsData || []);

            // Fetch recommendations (same type, different car)
            const { data: recommendationsData } = await supabase
                .from('vehicles')
                .select('*')
                .eq('type', mainVehicleData.type)
                .neq('name', mainVehicleData.name)
                .limit(4);

            setRecommendations(recommendationsData || []);

            // Fetch testimonials for this car
            const { data: testimonialsData } = await supabase
                .from('testimonials')
                .select('*')
                .eq('vehicleName', `${mainVehicleData.brand} ${mainVehicleData.name}`)
                .order('created_at', { ascending: false });

            setTestimonials(testimonialsData || []);
            
            // Fetch gallery photos for this car
            const { data: galleryData } = await supabase
                .from('gallery')
                .select('*')
                .eq('vehicleName', `${mainVehicleData.brand} ${mainVehicleData.name}`)
                .order('created_at', { ascending: false });

            setGallery(galleryData || []);

            setIsLoading(false);
        };

        fetchData();

    }, [supabase, vehicleId]);

    const { logoUrl } = useVehicleLogo(vehicle?.brand || '');
    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

    const hasDiscount = vehicle && vehicle.discountPercentage && vehicle.discountPercentage > 0;
    const discountedPrice = (hasDiscount && vehicle?.price)
        ? vehicle.price * (1 - vehicle.discountPercentage / 100)
        : vehicle?.price;

    const averageRating = useMemo(() => {
        if (!testimonials || testimonials.length === 0) return 0;
        const total = testimonials.reduce((acc, t) => acc + t.rating, 0);
        return total / testimonials.length;
    }, [testimonials]);
    
    const isOutOfStock = vehicle?.unitType === 'khusus' && (!vehicle.stock || vehicle.stock <= 0);


    if (isLoading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        )
    }

    if (!vehicle) {
        notFound();
    }
    
    return (
        <>
            <div className="container py-8 md:py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Image and Booking Section */}
                    <div className="lg:col-span-2">
                         <Button variant="outline" size="sm" asChild className="mb-4">
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {dictionary.backToHome}
                            </Link>
                        </Button>
                        <Card className="overflow-hidden">
                            <div className="relative aspect-video w-full">
                                <Image
                                    src={vehicle.photo!}
                                    alt={`${vehicle.brand} ${vehicle.name}`}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {logoUrl && (
                                     <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-sm p-1.5 rounded-md shadow-sm">
                                        <div className="relative h-8 w-12">
                                            <Image
                                                src={logoUrl}
                                                alt={`${vehicle.brand} logo`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Details and Pricing Section */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                             <div className="flex items-center justify-between">
                                <h1 className="text-3xl font-bold tracking-tight">{vehicle.brand} {vehicle.name}</h1>
                                {hasDiscount && <Badge variant="destructive">{vehicle.discountPercentage}% OFF</Badge>}
                             </div>
                            <div className="flex items-center gap-2">
                                <StarRating rating={averageRating} totalReviews={testimonials.length} />
                            </div>
                        </div>

                        <Card>
                            <CardHeader>
                                <CardTitle>{dictionary.vehicleDetail.details.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground"><Car className="h-4 w-4" /> {dictionary.vehicleDetail.details.brand}: <span className="font-medium text-foreground">{vehicle.brand}</span></div>
                                <div className="flex items-center gap-2 text-muted-foreground"><Car className="h-4 w-4" /> {dictionary.vehicleDetail.details.type}: <span className="font-medium text-foreground">{vehicle.type}</span></div>
                                <div className="flex items-center gap-2 text-muted-foreground"><Cog className="h-4 w-4" /> {dictionary.vehicleDetail.details.transmission}: <span className="font-medium text-foreground">{vehicle.transmission}</span></div>
                                <div className="flex items-center gap-2 text-muted-foreground"><Fuel className="h-4 w-4" /> {dictionary.vehicleDetail.details.fuel}: <span className="font-medium text-foreground">{vehicle.fuel}</span></div>
                                <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /> {dictionary.vehicleDetail.details.capacity}: <span className="font-medium text-foreground">{vehicle.passengers} {dictionary.vehicleDetail.details.passenger}</span></div>
                                <div className="flex items-center gap-2 text-muted-foreground"><CalendarIcon className="h-4 w-4" /> {dictionary.vehicleDetail.details.year}: <span className="font-medium text-foreground">{vehicle.year}</span></div>
                            </CardContent>
                        </Card>

                        <div className="space-y-4 rounded-lg border p-4">
                            <div className="flex justify-between items-baseline">
                                <p className="text-muted-foreground">{dictionary.vehicleDetail.pricePerDay}</p>
                                 {hasDiscount && discountedPrice ? (
                                    <div className="text-right">
                                        <p className="text-sm text-muted-foreground line-through">{formatCurrency(vehicle.price!)}</p>
                                        <p className="text-2xl font-bold text-primary">{formatCurrency(discountedPrice)}</p>
                                    </div>
                                ) : (
                                    <p className="text-2xl font-bold text-primary">{formatCurrency(vehicle.price!)}</p>
                                )}
                            </div>
                             {isOutOfStock ? (
                                <Button size="lg" className="w-full" disabled>{dictionary.vehicleCard.outOfStock}</Button>
                              ) : (
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button size="lg" className="w-full transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md active:scale-100">{dictionary.vehicleDetail.bookNow}</Button>
                                    </SheetTrigger>
                                    <SheetContent className="p-0 flex flex-col">
                                        <OrderForm variants={variants} />
                                    </SheetContent>
                                </Sheet>
                              )}
                        </div>
                    </div>
                </div>

                {/* Reviews and Gallery Section */}
                <div className="mt-12 md:mt-16">
                     <Tabs defaultValue="reviews" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
                            <TabsTrigger value="reviews">{dictionary.vehicleDetail.reviews.customerReviews}</TabsTrigger>
                            <TabsTrigger value="gallery">{dictionary.vehicleDetail.reviews.galleryTab}</TabsTrigger>
                        </TabsList>
                        <TabsContent value="reviews" className="mt-8">
                             {testimonials.length > 0 ? (
                                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                                    {testimonials.map(review => (
                                         <Card key={review.id} className="break-inside-avoid">
                                            <CardHeader>
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-base font-bold">{review.customerName}</CardTitle>
                                                    <div className="flex items-center gap-1 text-sm font-bold text-yellow-500">
                                                        <Star className="h-4 w-4 fill-current"/>
                                                        <span>{review.rating.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            {review.comment && (
                                                <CardContent>
                                                    <blockquote className="italic text-muted-foreground">"{review.comment}"</blockquote>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                             ) : (
                                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <MessageSquareQuote className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">{dictionary.vehicleDetail.reviews.noReviews}</h3>
                                </div>
                             )}
                        </TabsContent>
                        <TabsContent value="gallery" className="mt-8">
                             {gallery.length > 0 ? (
                                <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
                                    {gallery.map(item => (
                                        <div key={item.id} className="break-inside-avoid relative group overflow-hidden rounded-lg shadow-md">
                                            <Image
                                                src={item.url}
                                                alt={`${vehicle.name} gallery image`}
                                                width={400}
                                                height={400}
                                                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                                                data-ai-hint="customer photo"
                                            />
                                        </div>
                                    ))}
                                </div>
                             ) : (
                                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                                    <Car className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">{dictionary.vehicleDetail.reviews.noPhotos}</h3>
                                </div>
                             )}
                        </TabsContent>
                     </Tabs>
                </div>

                {/* Recommendations Section */}
                {recommendations.length > 0 && (
                    <div className="mt-16 md:mt-24">
                        <h2 className="text-2xl font-bold tracking-tight text-center mb-8">{dictionary.vehicleDetail.otherRecommendations}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {recommendations.map(rec => <VehicleCard key={rec.id} vehicle={rec} />)}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default function VehicleDetailPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <VehicleDetailContent />
        </Suspense>
    );
}
