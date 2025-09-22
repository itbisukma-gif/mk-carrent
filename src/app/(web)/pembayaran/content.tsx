
'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type Vehicle, type Driver, type Order } from '@/lib/types';
import { serviceCosts } from '@/lib/data';

import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Banknote, Loader2, QrCode } from 'lucide-react';
import { format, addDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

function PaymentPageContentInternal() {
    const { dictionary, language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();

    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'Transfer Bank' | 'QRIS'>('Transfer Bank');

    const vehicleId = searchParams.get('vehicleId');
    const rentalDays = parseInt(searchParams.get('days') || '1', 10);
    const serviceType = searchParams.get('service');
    const driverId = searchParams.get('driverId');

    const locale = language === 'id' ? id : undefined;

    useEffect(() => {
        const client = createClient();
        setSupabase(client);
    }, []);

    useEffect(() => {
        if (!supabase || !vehicleId) {
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            const { data: vehicleData, error: vehicleError } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', vehicleId)
                .single();
            
            if (vehicleError) {
                toast({ variant: 'destructive', title: "Kendaraan tidak ditemukan" });
                router.push('/');
                return;
            }
            setVehicle(vehicleData);

            if (driverId) {
                const { data: driverData, error: driverError } = await supabase
                    .from('drivers')
                    .select('*')
                    .eq('id', driverId)
                    .single();
                
                if (driverError) {
                    toast({ variant: 'destructive', title: "Driver tidak ditemukan" });
                }
                setDriver(driverData);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [supabase, vehicleId, driverId, router, toast]);

    const rentalPeriodString = useMemo(() => {
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        if (startDateStr && endDateStr) {
            const start = parseISO(startDateStr);
            const end = parseISO(endDateStr);
            return `${format(start, 'd LLL y', { locale })} - ${format(end, 'd LLL y', { locale })}`;
        }
        return `${rentalDays} ${dictionary.payment.days}`;
    }, [searchParams, rentalDays, dictionary, locale]);

    const { totalCost, discountAmount, baseRentalCost, maticFee, driverFee, fuelFee } = useMemo(() => {
        if (!vehicle || rentalDays <= 0) {
            return { totalCost: 0, discountAmount: 0, baseRentalCost: 0, maticFee: 0, driverFee: 0, fuelFee: 0 };
        }
        
        const rental = (vehicle.price || 0) * rentalDays;
        const mFee = vehicle.transmission === 'Matic' ? serviceCosts.matic * rentalDays : 0;
        const dFee = (serviceType === 'dengan-supir' || serviceType === 'all-include') ? serviceCosts.driver * rentalDays : 0;
        const fFee = (serviceType === 'all-include') ? serviceCosts.fuel * rentalDays : 0;

        const subtotal = rental + mFee + dFee + fFee;
        const discAmount = vehicle.discountPercentage && vehicle.price
            ? (rental * vehicle.discountPercentage) / 100 
            : 0;
        
        const total = subtotal - discAmount;

        return {
            totalCost: total,
            discountAmount: discAmount,
            baseRentalCost: rental,
            maticFee: mFee,
            driverFee: dFee,
            fuelFee: fFee,
        };
    }, [vehicle, rentalDays, serviceType]);

    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

    const handleConfirm = async () => {
        if (!customerName || !customerPhone) {
            toast({ variant: 'destructive', title: dictionary.payment.validation.title, description: dictionary.payment.validation.description });
            return;
        }

        if (!vehicle || !supabase) return;
        
        setIsProcessing(true);
        const orderId = `ORD-${Date.now()}`;

        const newOrder: Omit<Order, 'created_at'> = {
            id: orderId,
            customerName,
            customerPhone,
            carName: `${vehicle.brand} ${vehicle.name}`,
            type: vehicle.type,
            fuel: vehicle.fuel,
            transmission: vehicle.transmission,
            service: serviceType,
            driver: driver ? driver.name : null,
            paymentProof: null,
            status: 'pending',
            paymentMethod,
            total: totalCost,
            driverId: driver ? driver.id : null,
            vehicleId: vehicle.id,
        };

        const { error } = await supabase.from('orders').insert(newOrder);

        if (error) {
            toast({ variant: 'destructive', title: 'Gagal membuat pesanan', description: error.message });
            setIsProcessing(false);
            return;
        }
        
        const confirmationUrl = `/konfirmasi?orderId=${orderId}&startDate=${searchParams.get('startDate') || ''}&endDate=${searchParams.get('endDate') || ''}&days=${rentalDays}`;
        router.push(confirmationUrl);
    };

    if (isLoading || !vehicle) {
        return (
            <div className="container py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="container py-8 md:py-16">
            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold">{dictionary.payment.title}</h1>
                <p className="text-muted-foreground mt-2">{dictionary.payment.description}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Summary */}
                <div className="lg:col-span-1 lg:order-last">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>{dictionary.payment.orderSummary.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Image src={vehicle.photo || ''} alt={vehicle.name} width={100} height={66} className="rounded-md object-cover" />
                                <div>
                                    <h3 className="font-semibold">{vehicle.brand} {vehicle.name}</h3>
                                    <p className="text-sm text-muted-foreground">{rentalPeriodString}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{dictionary.payment.orderSummary.rentalPrice(rentalDays)}</span>
                                    <span>{formatCurrency(baseRentalCost)}</span>
                                </div>
                                {driverFee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{dictionary.payment.orderSummary.driverFee(rentalDays)}</span>
                                        <span>{formatCurrency(driverFee)}</span>
                                    </div>
                                )}
                                {fuelFee > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">{dictionary.payment.orderSummary.fuelFee(rentalDays)}</span>
                                        <span>{formatCurrency(fuelFee)}</span>
                                    </div>
                                )}
                                {maticFee > 0 && (
                                     <div className="flex justify-between">
                                        <span className="text-muted-foreground">{dictionary.payment.orderSummary.maticFee}</span>
                                        <span>{formatCurrency(maticFee)}</span>
                                    </div>
                                )}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span className="font-medium">Diskon ({vehicle.discountPercentage}%)</span>
                                        <span>- {formatCurrency(discountAmount)}</span>
                                    </div>
                                )}
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span>{dictionary.payment.orderSummary.totalPayment}</span>
                                <span className="text-primary">{formatCurrency(totalCost)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.payment.personalData.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="fullname">{dictionary.payment.personalData.fullName}</Label>
                                <Input id="fullname" placeholder={dictionary.payment.personalData.fullNamePlaceholder} value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">{dictionary.payment.personalData.phone}</Label>
                                <Input id="phone" type="tel" placeholder={dictionary.payment.personalData.phonePlaceholder} value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                                <p className="text-xs text-muted-foreground">{dictionary.payment.personalData.phoneHint}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.payment.paymentMethod.title}</CardTitle>
                        </CardHeader>
                         <CardContent>
                             <RadioGroup defaultValue="Transfer Bank" className="space-y-4" onValueChange={(value: 'Transfer Bank' | 'QRIS') => setPaymentMethod(value)}>
                                <Label htmlFor="transfer" className="flex items-start gap-4 rounded-md border p-4 cursor-pointer has-[:checked]:border-primary">
                                    <Banknote className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h4 className="font-semibold">{dictionary.payment.paymentMethod.bank.title}</h4>
                                        <p className="text-sm text-muted-foreground">{dictionary.payment.paymentMethod.bank.description}</p>
                                    </div>
                                     <RadioGroupItem value="Transfer Bank" id="transfer" className="mt-1" />
                                </Label>
                                 <Label htmlFor="qris" className="flex items-start gap-4 rounded-md border p-4 cursor-pointer has-[:checked]:border-primary">
                                    <QrCode className="h-6 w-6 mt-1 text-primary flex-shrink-0" />
                                    <div className="flex-grow">
                                        <h4 className="font-semibold">{dictionary.payment.paymentMethod.qris.title}</h4>
                                        <p className="text-sm text-muted-foreground">{dictionary.payment.paymentMethod.qris.description}</p>
                                    </div>
                                    <RadioGroupItem value="QRIS" id="qris" className="mt-1" />
                                </Label>
                            </RadioGroup>
                         </CardContent>
                    </Card>
                    
                     <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                        <Button variant="outline" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                        <Button size="lg" onClick={handleConfirm} disabled={isProcessing}>
                             {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             {dictionary.payment.confirmAndPay}
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
}

export function PaymentPageContent() {
    return (
        <Suspense fallback={<div className="container py-16 text-center"><Loader2 className="mx-auto h-8 w-8 animate-spin" /></div>}>
            <PaymentPageContentInternal />
        </Suspense>
    )
}

    