
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { StarRating } from '@/components/star-rating';
import { VehicleCard } from '@/components/vehicle-card';
import { OrderForm } from '@/components/order-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Vehicle, Testimonial, GalleryItem } from '@/lib/types';
import { Users, Cog, Fuel, Calendar, Car, MessageSquare, GalleryHorizontal } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';
import { useVehicleLogo } from '@/hooks/use-vehicle-logo';
import { LanguageProvider } from '@/app/language-provider';

// This function tells Next.js which vehicle IDs to generate static pages for at build time.
export async function generateStaticParams() {
  const supabase = createClient();
  const { data: vehicles } = await supabase.from('vehicles').select('id');

  if (!vehicles) {
    return [];
  }

  return vehicles.map((vehicle) => ({
    id: vehicle.id,
  }));
}

async function getVehicleData(id: string) {
    const supabase = createClient();
    const { data: vehicle, error } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error || !vehicle) {
        notFound();
    }
    
    const { data: variants } = await supabase
        .from('vehicles')
        .select('*')
        .eq('brand', vehicle.brand)
        .eq('name', vehicle.name);

    const vehicleFullName = `${vehicle.brand} ${vehicle.name}`;
    
    const { data: testimonials } = await supabase
        .from('testimonials')
        .select('*')
        .eq('vehicleName', vehicleFullName)
        .order('created_at', { ascending: false });

    const { data: galleryItems } = await supabase
        .from('gallery')
        .select('*')
        .eq('vehicleName', vehicleFullName)
        .order('created_at', { ascending: false });

    const { data: otherVehicles } = await supabase
        .from('vehicles')
        .select('*')
        .neq('id', id)
        .limit(4);

    return {
        vehicle,
        variants: variants || [],
        testimonials: testimonials || [],
        gallery: galleryItems || [],
        otherVehicles: otherVehicles || []
    };
}


function VehicleSpecs({ vehicle, dict }: { vehicle: Vehicle, dict: any }) {
    return (
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2"><Car className="h-5 w-5 text-primary" /><span>{dict.brand}: <span className="font-semibold">{vehicle.brand}</span></span></div>
            <div className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /><span>{dict.capacity}: <span className="font-semibold">{vehicle.passengers} {dict.passenger}</span></span></div>
            <div className="flex items-center gap-2"><Cog className="h-5 w-5 text-primary" /><span>{dict.transmission}: <span className="font-semibold">{vehicle.transmission}</span></span></div>
            <div className="flex items-center gap-2"><Fuel className="h-5 w-5 text-primary" /><span>{dict.fuel}: <span className="font-semibold">{vehicle.fuel}</span></span></div>
            <div className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /><span>{dict.year}: <span className="font-semibold">{vehicle.year}</span></span></div>
        </div>
    )
}

function VehicleReviews({ testimonials, dict }: { testimonials: Testimonial[], dict: any }) {
    if (testimonials.length === 0) {
        return <p className="text-muted-foreground text-sm">{dict.noReviews}</p>
    }
    return (
        <div className="space-y-6">
            {testimonials.map(t => (
                <div key={t.id} className="flex flex-col gap-2 border-b pb-4">
                     <LanguageProvider><StarRating rating={t.rating} /></LanguageProvider>
                     <p className="text-sm text-muted-foreground italic">"{t.comment}"</p>
                     <p className="text-sm font-semibold self-end">- {t.customerName}</p>
                </div>
            ))}
        </div>
    )
}

function VehicleGallery({ gallery, dict }: { gallery: GalleryItem[], dict: any }) {
     if (gallery.length === 0) {
        return <p className="text-muted-foreground text-sm">{dict.noPhotos}</p>
    }
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map(item => (
                <div key={item.id} className="aspect-square relative rounded-lg overflow-hidden">
                    <Image src={item.url} alt="Foto galeri mobil" fill className="object-cover"/>
                </div>
            ))}
        </div>
    )
}

function VehicleLogo({ brand }: { brand: string }) {
    const { logoUrl } = useVehicleLogo(brand);
    if (!logoUrl) return null;

    return (
        <div className="absolute top-3 left-3 bg-white/70 backdrop-blur-sm p-1.5 rounded-md shadow-sm">
            <div className="relative h-8 w-12">
                <Image
                    src={logoUrl}
                    alt={`${brand} logo`}
                    fill
                    className="object-contain"
                />
            </div>
        </div>
    );
}

export default async function VehicleDetailPage({ params }: { params: { id: string } }) {
    const { vehicle, variants, testimonials, gallery, otherVehicles } = await getVehicleData(params.id);
    const dict = dictionaries['id'].vehicleDetail; // Using 'id' dictionary for now

    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

    return (
        <LanguageProvider>
            <div className="flex flex-col min-h-screen">
                <WebHeader />
                <main className="flex-1">
                    <div className="container py-6 md:py-10">
                        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                            {/* Left Column: Image & Details */}
                            <div>
                                 <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg mb-6">
                                    <Image src={vehicle.photo} alt={vehicle.name} fill className="object-cover" data-ai-hint={vehicle.dataAiHint || ''}/>
                                    <VehicleLogo brand={vehicle.brand} />
                                </div>
                                <h2 className="text-2xl font-bold">{dict.details.title}</h2>
                                <Separator className="my-4"/>
                                <VehicleSpecs vehicle={vehicle} dict={dict.details} />
                            </div>
                            {/* Right Column: Title, Price, Order */}
                            <div className="flex flex-col">
                                <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{vehicle.brand} {vehicle.name}</h1>
                                {vehicle.rating && <div className="mt-2"><StarRating rating={vehicle.rating} totalReviews={testimonials.length} /></div>}
                                <div className="mt-6 bg-muted/50 rounded-lg p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">{dict.pricePerDay}</p>
                                        <p className="text-3xl font-bold text-primary">{formatCurrency(vehicle.price || 0)}</p>
                                    </div>
                                    <Sheet>
                                        <SheetTrigger asChild>
                                            <Button size="lg" className="w-full mt-4 transition-all duration-200 ease-in-out hover:scale-105 hover:shadow-md active:scale-100">{dict.bookNow}</Button>
                                        </SheetTrigger>
                                        <SheetContent className="p-0 flex flex-col">
                                            <OrderForm variants={variants} />
                                        </SheetContent>
                                    </Sheet>
                                </div>
                            </div>
                        </div>
                         {/* Reviews & Gallery Section */}
                        <div className="mt-12 md:mt-16">
                             <Card>
                                 <CardContent className="p-6">
                                    <Tabs defaultValue="reviews" className="w-full">
                                        <TabsList className="grid w-full grid-cols-2 mb-6">
                                            <TabsTrigger value="reviews"><MessageSquare className="mr-2 h-4 w-4"/> {dict.reviews.customerReviews}</TabsTrigger>
                                            <TabsTrigger value="gallery"><GalleryHorizontal className="mr-2 h-4 w-4"/> {dict.reviews.galleryTab}</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="reviews">
                                            <VehicleReviews testimonials={testimonials} dict={dict.reviews} />
                                        </TabsContent>
                                        <TabsContent value="gallery">
                                            <VehicleGallery gallery={gallery} dict={dict.reviews} />
                                        </TabsContent>
                                    </Tabs>
                                </CardContent>
                             </Card>
                        </div>

                        {/* Other Recommendations */}
                        {otherVehicles.length > 0 && (
                            <div className="mt-12 md:mt-16">
                                <h2 className="text-2xl font-bold tracking-tight mb-6">{dict.otherRecommendations}</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {otherVehicles.map(v => <VehicleCard key={v.id} vehicle={v} />)}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
                <WebFooter />
            </div>
        </LanguageProvider>
    )
}

    