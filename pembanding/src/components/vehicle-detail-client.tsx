'use client'

import Image from 'next/image';
import { testimonials, fleet } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserCircle, Tag, Cog, Users, Fuel, Calendar, CheckCircle } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { VehicleCard } from '@/components/vehicle-card';
import { useRef, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { StarRating } from '@/components/star-rating';
import { useLanguage } from '@/hooks/use-language';
import { OrderForm } from '@/components/order-form';
import { Separator } from '@/components/ui/separator';

export function VehicleDetailClient({ vehicle }: { vehicle: Vehicle }) {
  const { dictionary } = useLanguage();
  const plugin = useRef(
      Autoplay({ delay: 3000, stopOnInteraction: true })
  )
  const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
  const vehicleTestimonials = testimonials.filter(t => t.vehicleName.includes(vehicle.name));
  const otherVehicles = fleet.filter(f => f.id !== vehicle.id).slice(0, 6);
  const [userRating, setUserRating] = useState(0);

  const hasDiscount = vehicle.discountPercentage && vehicle.discountPercentage > 0;
  const discountedPrice = hasDiscount ? vehicle.price * (1 - vehicle.discountPercentage! / 100) : vehicle.price;

  const vehicleDetails = [
    { label: dictionary.vehicleDetail.details.brand, value: vehicle.brand, icon: CheckCircle },
    { label: dictionary.vehicleDetail.details.type, value: vehicle.type, icon: CheckCircle },
    { label: dictionary.vehicleDetail.details.transmission, value: vehicle.transmission, icon: Cog },
    { label: dictionary.vehicleDetail.details.fuel, value: vehicle.fuel, icon: Fuel },
    { label: dictionary.vehicleDetail.details.capacity, value: `${vehicle.passengers} ${dictionary.vehicleDetail.details.passenger}`, icon: Users },
    { label: dictionary.vehicleDetail.details.year, value: vehicle.year, icon: Calendar },
  ];

  return (
    <div className="container py-6 md:py-10">
      {/* Mobile-first: single column layout */}
      <div className="flex flex-col gap-6 lg:gap-8">
        
        {/* Image Gallery */}
        <div className="relative">
           <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-md">
            <Image 
                src={vehicle.photo} 
                alt={`${vehicle.brand} ${vehicle.name}`} 
                fill 
                className="object-cover" 
                data-ai-hint={vehicle.dataAiHint}
            />
          </div>
           {hasDiscount && (
            <Badge variant="destructive" className="absolute top-3 right-3 text-sm py-1 px-2 shadow-lg">
              <Tag className="h-4 w-4 mr-1.5" />
              {vehicle.discountPercentage}% OFF
            </Badge>
          )}
        </div>

        {/* Details and Booking */}
        <div className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">{vehicle.brand} {vehicle.name}</h1>
            <StarRating rating={vehicle.rating} totalReviews={vehicleTestimonials.length} />
          </div>
          
          <Card>
            <CardHeader className='p-4'>
                <CardTitle className="text-base">{dictionary.vehicleDetail.details.title}</CardTitle>
            </CardHeader>
            <CardContent className='p-4 pt-0'>
                <ul className="space-y-2.5 text-sm">
                    {vehicleDetails.map(detail => (
                        <li key={detail.label} className="flex items-center gap-3">
                            <detail.icon className="h-4 w-4 text-primary" />
                            <span className="text-muted-foreground">{detail.label}:</span>
                            <span className="font-medium ml-auto">{detail.value}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>
          
           <Card className="mt-2">
            <CardContent className="p-4 space-y-4">
               <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Harga per hari</span>
                   {hasDiscount ? (
                      <div className='text-right'>
                          <p className="text-sm line-through text-muted-foreground">{formatCurrency(vehicle.price)}</p>
                          <p className="text-xl font-bold text-primary">{formatCurrency(discountedPrice)}</p>
                      </div>
                    ) : (
                      <p className="text-xl font-bold text-primary">{formatCurrency(vehicle.price)}</p>
                  )}
               </div>
               <Separator />
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="lg" className="w-full">{dictionary.vehicleDetail.bookNow}</Button>
                  </SheetTrigger>
                  <SheetContent className="p-0 flex flex-col">
                    <OrderForm vehicle={vehicle} />
                  </SheetContent>
                </Sheet>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Reviews & Other Cars Section */}
      <div className="mt-12 pt-8 border-t">
         <div className="flex flex-col gap-8">
             <div>
                <h2 className="text-xl font-bold mb-4">{dictionary.vehicleDetail.reviews.customerReviews}</h2>
                <Card className="shadow-sm">
                    <CardContent className="p-0">
                        <ScrollArea className="h-80 w-full">
                           <div className="p-4 space-y-5">
                             {vehicleTestimonials.length > 0 ? vehicleTestimonials.map(t => (
                               <div key={t.id} className="flex gap-3">
                                   <UserCircle className="h-10 w-10 text-muted-foreground flex-shrink-0 mt-1"/>
                                   <div>
                                       <div className="flex items-center justify-between mb-1">
                                            <p className="font-semibold">{t.customerName}</p>
                                            <StarRating rating={t.rating} />
                                       </div>
                                       <p className="text-sm text-muted-foreground italic">&quot;{t.comment}&quot;</p>
                                   </div>
                               </div>
                             )) : <p className="text-muted-foreground text-center py-8 text-sm">{dictionary.vehicleDetail.reviews.noReviews}</p>}
                           </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader className='p-4'>
                    <CardTitle className="text-base">{dictionary.vehicleDetail.reviews.shareExperience}</CardTitle>
                    <CardDescription className="text-sm">{dictionary.vehicleDetail.reviews.formDescription}</CardDescription>
                </CardHeader>
                    <CardContent className="space-y-4 p-4 pt-0">
                    <Textarea placeholder={dictionary.vehicleDetail.reviews.commentPlaceholder} rows={4} />
                    <div className="flex justify-between items-center bg-muted/50 p-2 rounded-md">
                        <p className="font-medium text-sm">{dictionary.vehicleDetail.reviews.yourRating}</p>
                            <StarRating rating={userRating} onRatingChange={setUserRating} />
                    </div>
                    <Button className="w-full">{dictionary.vehicleDetail.reviews.submitReview}</Button>
                </CardContent>
            </Card>
         </div>
      </div>

       {/* Other Cars Section */}
       <div className="mt-12 pt-8 border-t">
          <h2 className="text-xl font-bold tracking-tight text-center mb-6">{dictionary.vehicleDetail.otherRecommendations}</h2>
           <Carousel 
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[plugin.current]}
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.reset}
              className="w-full"
           >
              <CarouselContent className="-ml-2">
                {otherVehicles.map((v) => (
                  <CarouselItem key={v.id} className="pl-2 basis-4/5 sm:basis-1/2">
                    <div className="p-1 h-full">
                      <VehicleCard vehicle={v} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden sm:flex" />
              <CarouselNext className="hidden sm:flex"/>
           </Carousel>
       </div>
    </div>
  )
}
