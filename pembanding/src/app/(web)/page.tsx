

'use client'

import { useState, useMemo, useEffect, useRef } from 'react';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"


import { fleet } from '@/lib/data';
import { Filter } from 'lucide-react';
import { VehicleCard } from '@/components/vehicle-card';
import { useLanguage } from '@/hooks/use-language';
import { LanguageProvider } from '@/app/language-provider';

function HomePageContent() {
    const { dictionary } = useLanguage();
    const [visibleCars, setVisibleCars] = useState(6);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({ brand: 'all', type: 'all' });
    const [sortBy, setSortBy] = useState('price-asc');
    const [isSheetOpen, setSheetOpen] = useState(false);
    
    const plugin = useRef(
      Autoplay({ delay: 5000, stopOnInteraction: true })
    )

    const loadMoreCars = () => {
        setVisibleCars(prev => prev + 4);
    }
    
    const resetFilters = () => {
        setSearchQuery('');
        setFilters({ brand: 'all', type: 'all' });
        setSortBy('price-asc');
    };

    const handleBrandChange = (brand: string) => {
        setFilters(prev => ({ ...prev, brand: brand }));
    };

    const handleTypeChange = (type: string) => {
        setFilters(prev => ({ ...prev, type: type }));
    };
    
    const filteredFleet = useMemo(() => {
        return fleet.filter(vehicle => {
            const searchMatch = vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) || vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase());
            const brandMatch = filters.brand === 'all' || vehicle.brand === filters.brand;
            const typeMatch = filters.type === 'all' || vehicle.type === filters.type;
            return searchMatch && brandMatch && typeMatch;
        });
    }, [searchQuery, filters]);

    const availableBrands = useMemo(() => {
        const brands = new Set(
            fleet
                .filter(v => filters.type === 'all' || v.type === filters.type)
                .map(v => v.brand)
        );
        return ['all', ...Array.from(brands)];
    }, [filters.type]);

    const availableTypes = useMemo(() => {
        const types = new Set(
            fleet
                .filter(v => filters.brand === 'all' || v.brand === filters.brand)
                .map(v => v.type)
        );
        return ['all', ...Array.from(types)];
    }, [filters.brand]);
    
    useEffect(() => {
        if (!availableTypes.includes(filters.type)) {
            setFilters(f => ({ ...f, type: 'all' }));
        }
    }, [filters.brand, availableTypes, filters.type]);
    
    useEffect(() => {
        if (!availableBrands.includes(filters.brand)) {
            setFilters(f => ({ ...f, brand: 'all' }));
        }
    }, [filters.type, availableBrands, filters.brand]);


    const sortedFleet = useMemo(() => {
        return [...filteredFleet].sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'rating-desc':
                    return b.rating - a.rating;
                default:
                    return 0;
            }
        });
    }, [filteredFleet, sortBy]);

  return (
        <div>
            {/* Hero Section with Promo Slider */}
            <section className="w-full">
                 <div className="relative group rounded-lg overflow-hidden">
                    <Carousel 
                        opts={{ loop: true }}
                        plugins={[plugin.current]}
                        onMouseEnter={plugin.current.stop}
                        onMouseLeave={plugin.current.reset}
                        className="w-full"
                    >
                        <CarouselContent>
                            {fleet.slice(0, 3).map((vehicle) => (
                            <CarouselItem key={vehicle.id}>
                                <div className="relative h-[60vh] md:h-[70vh]">
                                    <Image src={vehicle.photo} alt={vehicle.name} fill className="object-cover" data-ai-hint={`${vehicle.dataAiHint} banner`} />
                                     <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent p-6 sm:p-8 md:p-12 flex flex-col items-start justify-center">
                                        <div className='max-w-md'>
                                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">{dictionary.home.hero.title(vehicle.brand, vehicle.name)}</h2>
                                            <p className="text-base md:text-lg text-primary-foreground/80 mt-3 md:mt-4 hidden sm:block">{dictionary.home.hero.description}</p>
                                            <Button size="lg" className="mt-6">{dictionary.home.hero.bookNow}</Button>
                                        </div>
                                     </div>
                                </div>
                            </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-50 group-hover:opacity-100 transition-opacity" />
                    </Carousel>
                 </div>
            </section>
            
            {/* Main Content */}
            <section className="container py-8 md:py-16">
                 <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{dictionary.home.fleet.title}</h2>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input 
                            placeholder={dictionary.home.fleet.searchPlaceholder} 
                            className="w-full sm:max-w-xs"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)} 
                        />
                        <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" className='w-full sm:w-auto'>
                                    <Filter className="mr-2 h-4 w-4" />
                                    {dictionary.home.fleet.filterAndSort}
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>{dictionary.home.fleet.filterAndSort}</SheetTitle>
                                    <SheetDescription>
                                        {dictionary.home.fleet.filterDescription}
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="py-4 space-y-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">{dictionary.home.fleet.filters.brand.title}</h4>
                                         <Select value={filters.brand} onValueChange={handleBrandChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={dictionary.home.fleet.filters.brand.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableBrands.map(brand => (
                                                    <SelectItem key={brand} value={brand}>
                                                        {brand === 'all' ? dictionary.home.fleet.filters.brand.all : brand}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="space-y-4">
                                         <h4 className="font-semibold">{dictionary.home.fleet.filters.type.title}</h4>
                                          <Select value={filters.type} onValueChange={handleTypeChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={dictionary.home.fleet.filters.type.placeholder} />
                                            </SelectTrigger>
                                            <SelectContent>
                                               {availableTypes.map(type => (
                                                    <SelectItem key={type} value={type}>
                                                        {type === 'all' ? dictionary.home.fleet.filters.type.all : type}
                                                    </SelectItem>
                                               ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Separator />
                                    <div className="space-y-4">
                                        <h4 className="font-semibold">{dictionary.home.fleet.sort.title}</h4>
                                         <RadioGroup value={sortBy} onValueChange={setSortBy} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="price-asc" id="s-price-asc" />
                                                <Label htmlFor="s-price-asc">{dictionary.home.fleet.sort.priceAsc}</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="price-desc" id="s-price-desc" />
                                                <Label htmlFor="s-price-desc">{dictionary.home.fleet.sort.priceDesc}</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="rating-desc" id="s-rating-desc" />
                                                <Label htmlFor="s-rating-desc">{dictionary.home.fleet.sort.ratingDesc}</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>
                                <SheetFooter>
                                    <Button variant="secondary" onClick={resetFilters}>{dictionary.home.fleet.reset}</Button>
                                    <Button onClick={() => setSheetOpen(false)}>{dictionary.home.fleet.showResults}</Button>
                                </SheetFooter>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {sortedFleet.slice(0, visibleCars).map(vehicle => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                    ))}
                </div>

                {visibleCars < sortedFleet.length && (
                     <div className="mt-12 text-center">
                        <Button onClick={loadMoreCars} size="lg" variant="outline">
                            {dictionary.home.fleet.showMore}
                        </Button>
                    </div>
                )}
            </section>
        </div>
  );
}

export default function HomePage() {
  return (
    <LanguageProvider>
      <HomePageContent />
    </LanguageProvider>
  )
}


    
