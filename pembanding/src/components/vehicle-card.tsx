
'use client'

import Link from 'next/link';
import Image from 'next/image';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Users, Cog, Tag } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { OrderForm } from '@/components/order-form';
import { useLanguage } from '@/hooks/use-language';


export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const { dictionary } = useLanguage();
  const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
  
  const hasDiscount = vehicle.discountPercentage && vehicle.discountPercentage > 0;
  const discountedPrice = hasDiscount ? vehicle.price * (1 - vehicle.discountPercentage! / 100) : vehicle.price;

  return (
      <Card className="overflow-hidden group flex flex-col h-full shadow-md">
          <Link href={`/mobil/${vehicle.id}`} className="relative">
            <CardContent className="p-0">
              <div className="aspect-video w-full relative">
                  <Image
                    src={vehicle.photo}
                    alt={vehicle.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    data-ai-hint={vehicle.dataAiHint}
                  />
              </div>
            </CardContent>
            {hasDiscount && (
              <Badge variant="destructive" className="absolute top-2 right-2 shadow-lg">
                <Tag className="h-3 w-3 mr-1" />
                {vehicle.discountPercentage}% OFF
              </Badge>
            )}
          </Link>
          <div className="p-4 flex flex-col flex-grow">
            <div className="flex-grow">
                <Link href={`/mobil/${vehicle.id}`} className="hover:text-primary">
                    <h3 className="text-base font-bold leading-snug">{vehicle.name}</h3>
                    <p className="text-xs text-muted-foreground">{vehicle.brand} - {vehicle.type}</p>
                </Link>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-3">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>{vehicle.passengers}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Cog className="h-4 w-4" />
                <span>{vehicle.transmission}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t flex items-end justify-between">
              <div className="flex-shrink-0">
                  {hasDiscount ? (
                  <>
                      <p className="text-xs text-muted-foreground line-through">{formatCurrency(vehicle.price)}</p>
                      <p className="text-base font-bold text-primary leading-tight">{formatCurrency(discountedPrice)}<span className="text-xs font-normal">/{dictionary.vehicleCard.day}</span></p>
                  </>
                  ) : (
                  <>
                      <p className="text-xs text-muted-foreground">{dictionary.vehicleCard.priceStartFrom}</p>
                      <p className="text-base font-bold text-primary leading-tight">{formatCurrency(vehicle.price)}<span className="text-xs font-normal">/{dictionary.vehicleCard.day}</span></p>
                  </>
                  )}
              </div>
              <Sheet>
                <SheetTrigger asChild>
                    <Button size="sm">{dictionary.vehicleCard.book}</Button>
                </SheetTrigger>
                <SheetContent className="p-0 flex flex-col">
                    <OrderForm vehicle={vehicle} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
      </Card>
  );
}
