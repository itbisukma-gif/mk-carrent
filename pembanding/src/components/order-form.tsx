
'use client';

import { useState, useMemo, useEffect, forwardRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import {
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"


import type { Vehicle } from '@/lib/types';
import { Minus, Plus, CalendarIcon } from 'lucide-react';
import { format, addDays, differenceInCalendarDays, isBefore, startOfDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

const SERVICE_COSTS = {
    driver: 150000, // Harga layanan supir per hari
    matic: 50000,   // Biaya tambahan untuk transmisi matic per hari
};

export const OrderForm = forwardRef<HTMLDivElement, { vehicle: Vehicle }>(({ vehicle }, ref) => {
    const { dictionary, language } = useLanguage();
    const [activeTab, setActiveTab] = useState('reservation');
    const [rentalDays, setRentalDays] = useState(1);
    const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [service, setService] = useState('lepas-kunci');

    useEffect(() => {
        const today = startOfDay(new Date());
        setStartDate(today);
        setEndDate(addDays(today, 1));
    }, []);


    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

    const calculatedDuration = useMemo(() => {
        if (activeTab === 'reservation') {
            if (startDate && endDate) {
                const diff = differenceInCalendarDays(endDate, startDate);
                return diff >= 1 ? diff : 1;
            }
            return 1;
        }
        return rentalDays > 0 ? rentalDays : 1;
    }, [startDate, endDate, rentalDays, activeTab]);

    const { totalCost, discountAmount, baseRentalCost, maticFee, driverFee } = useMemo(() => {
        if (calculatedDuration <= 0) {
            return { totalCost: 0, discountAmount: 0, baseRentalCost: 0, maticFee: 0, driverFee: 0 };
        }
        
        const rental = vehicle.price * calculatedDuration;
        const mFee = vehicle.transmission === 'Matic' ? SERVICE_COSTS.matic * calculatedDuration : 0;
        const dFee = service === 'dengan-supir' ? SERVICE_COSTS.driver * calculatedDuration : 0;
        const subtotal = rental + mFee + dFee;

        const discAmount = vehicle.discountPercentage 
            ? (rental * vehicle.discountPercentage) / 100 
            : 0;
        
        const total = subtotal - discAmount;

        return {
            totalCost: total,
            discountAmount: discAmount,
            baseRentalCost: rental,
            maticFee: mFee,
            driverFee: dFee,
        };
    }, [vehicle, calculatedDuration, service]);
    
    const handleStartDateChange = (date: Date | undefined) => {
        if (!date) return;
        const newStartDate = startOfDay(date);
        setStartDate(newStartDate);
        if (endDate && isBefore(endDate, newStartDate)) {
            setEndDate(addDays(newStartDate, 1));
        } else if (!endDate) {
            setEndDate(addDays(newStartDate, 1));
        }
    };
    
    const handleEndDateChange = (date: Date | undefined) => {
        if (!date || !startDate) return;
        let newEndDate = startOfDay(date);
        if (isBefore(newEndDate, startDate)) {
            newEndDate = startOfDay(startDate);
        }
        setEndDate(newEndDate);
    };

    const paymentUrl = useMemo(() => {
        let url = `/pembayaran?vehicleId=${vehicle.id}&days=${calculatedDuration}&service=${service}`;
        if (activeTab === 'reservation' && startDate && endDate) {
            url += `&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
        }
        return url;
    }, [vehicle.id, calculatedDuration, service, activeTab, startDate, endDate]);

    const locale = language === 'id' ? id : undefined;

    return (
      <div className="flex flex-col h-full" ref={ref}>
        <SheetHeader className="p-6 border-b flex-shrink-0">
          <SheetTitle>{dictionary.orderForm.title}</SheetTitle>
        </SheetHeader>
        
        <div className="p-6 border-b flex-shrink-0">
            <div className="flex items-center gap-4">
                <Image src={vehicle.photo} alt={vehicle.name} width={120} height={80} className="rounded-lg object-cover" data-ai-hint={vehicle.dataAiHint} />
                <div>
                    <h3 className="font-bold text-lg">{vehicle.brand} {vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                </div>
            </div>
        </div>
        
        <div className="flex-grow overflow-y-auto p-6">
            <Tabs defaultValue="reservation" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="direct">{dictionary.orderForm.tabs.direct.title}</TabsTrigger>
                    <TabsTrigger value="reservation">{dictionary.orderForm.tabs.reservation.title}</TabsTrigger>
                </TabsList>
                <TabsContent value="direct" className="mt-6 space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{dictionary.orderForm.tabs.direct.duration}</label>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setRentalDays(Math.max(1, rentalDays - 1))} className="hover:bg-transparent text-muted-foreground hover:text-primary">
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="h-10 w-16 flex items-center justify-center border border-input rounded-md text-sm">
                                {rentalDays}
                            </div>
                             <Button variant="ghost" size="icon" onClick={() => setRentalDays(rentalDays + 1)} className="hover:bg-transparent text-muted-foreground hover:text-primary">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </TabsContent>
                <TabsContent value="reservation" className="mt-6 space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                             <Label htmlFor="start-date">{dictionary.orderForm.tabs.reservation.startDate}</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal text-sm px-2">
                                        <CalendarIcon className="mr-1 h-4 w-4" />
                                        <span className="truncate w-full">
                                            {startDate ? format(startDate, 'd LLL y', { locale }) : <span>{dictionary.orderForm.tabs.reservation.selectDate}</span>}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={startDate}
                                        onSelect={handleStartDateChange}
                                        disabled={{ before: startOfDay(new Date()) }}
                                        initialFocus
                                        locale={locale}
                                    />
                                </PopoverContent>
                            </Popover>
                         </div>
                         <div className="space-y-2">
                             <Label htmlFor="end-date">{dictionary.orderForm.tabs.reservation.endDate}</Label>
                             <Popover>
                                <PopoverTrigger asChild>
                                     <Button variant="outline" className="w-full justify-start text-left font-normal text-sm px-2" disabled={!startDate}>
                                        <CalendarIcon className="mr-1 h-4 w-4" />
                                        <span className="truncate w-full">
                                            {endDate ? format(endDate, 'd LLL y', { locale }) : <span>{dictionary.orderForm.tabs.reservation.selectDate}</span>}
                                        </span>
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={endDate}
                                        onSelect={handleEndDateChange}
                                        disabled={startDate ? { before: addDays(startDate,1) } : { before: startOfDay(new Date()) }}
                                        initialFocus
                                        locale={locale}
                                    />
                                </PopoverContent>
                            </Popover>
                         </div>
                     </div>
                </TabsContent>

                {/* Common Fields */}
                <div className="space-y-4 pt-4 border-t mt-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">{dictionary.orderForm.common.transmission.label}</label>
                         <Input value={vehicle.transmission} readOnly disabled />
                    </div>
                     <div className="space-y-2">
                        <label className="text-sm font-medium">{dictionary.orderForm.common.service.label}</label>
                        <Select value={service} onValueChange={setService}>
                            <SelectTrigger>
                                <SelectValue placeholder={dictionary.orderForm.common.service.placeholder} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="lepas-kunci">{dictionary.orderForm.common.service.options.selfDrive}</SelectItem>
                                <SelectItem value="dengan-supir">{dictionary.orderForm.common.service.options.withDriver}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Tabs>
        </div>
        <div className="p-6 border-t mt-auto bg-background flex-shrink-0">
             <h4 className="font-semibold mb-2">{dictionary.orderForm.summary.title}</h4>
             <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                    <span>{dictionary.orderForm.summary.basePrice}</span>
                    <span>{formatCurrency(vehicle.price)} x {calculatedDuration} hari</span>
                </div>
                {driverFee > 0 && (
                   <div className="flex justify-between">
                       <span>{dictionary.orderForm.summary.driverFee}</span>
                       <span>{formatCurrency(driverFee)}</span>
                   </div>
                )}
                {maticFee > 0 && (
                   <div className="flex justify-between">
                       <span>{dictionary.orderForm.summary.maticFee}</span>
                       <span>{formatCurrency(maticFee)}</span>
                   </div>
                )}
                 {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span className="font-medium">Diskon ({vehicle.discountPercentage}%)</span>
                        <span>- {formatCurrency(discountAmount)}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2">
                    <span>{dictionary.orderForm.summary.total}</span>
                    <span>{formatCurrency(totalCost)}</span>
                </div>
             </div>
             <Button className="w-full mt-4" disabled={calculatedDuration <= 0} asChild>
                <Link href={paymentUrl}>
                    {dictionary.orderForm.bookNow}
                </Link>
            </Button>
        </div>
      </div>
    );
});
OrderForm.displayName = 'OrderForm';
