
'use client'

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useMemo, useEffect, ChangeEvent } from "react";
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck } from "lucide-react";

import { useLanguage } from "@/hooks/use-language";
import type { Vehicle, Driver, BankAccount } from "@/lib/types";
import { serviceCosts, bankAccounts as initialBankAccounts } from "@/lib/data";
import { bankList } from "@/lib/bank-data";
import { WhatsAppIcon, Logo } from "@/components/icons";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import type { SupabaseClient } from '@supabase/supabase-js';

function PaymentForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();
    const { dictionary } = useLanguage();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("bank");

    const vehicleId = searchParams.get('vehicleId');
    const days = parseInt(searchParams.get('days') || '1', 10);
    const service = searchParams.get('service') || 'lepas-kunci';
    const driverId = searchParams.get('driverId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    useEffect(() => {
        const supabaseClient = createClient();
        setSupabase(supabaseClient);
    }, []);

    useEffect(() => {
        if (!vehicleId || !supabase) return;

        const fetchData = async () => {
            setIsLoading(true);
            const { data: vehicleData } = await supabase.from('vehicles').select('*').eq('id', vehicleId).single();
            setVehicle(vehicleData);

            if (driverId) {
                const { data: driverData } = await supabase.from('drivers').select('*').eq('id', driverId).single();
                setDriver(driverData);
            }
            setIsLoading(false);
        };
        fetchData();
    }, [vehicleId, driverId, supabase]);

    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

    const rentalPeriod = useMemo(() => {
        if (startDate && endDate) {
            return `${new Date(startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })} - ${new Date(endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
        }
        return `${days} ${dictionary.payment.days}`;
    }, [startDate, endDate, days, dictionary]);

     const { totalCost, discountAmount, baseRentalCost, maticFee, driverFee, fuelFee } = useMemo(() => {
        if (!vehicle) return { totalCost: 0, discountAmount: 0, baseRentalCost: 0, maticFee: 0, driverFee: 0, fuelFee: 0 };
        
        const rental = (vehicle.price || 0) * days;
        const mFee = vehicle.transmission === 'Matic' ? serviceCosts.matic * days : 0;
        const dFee = (service === 'dengan-supir' || service === 'all-include') ? serviceCosts.driver * days : 0;
        const fFee = (service === 'all-include') ? serviceCosts.fuel * days : 0;
        
        const discAmount = vehicle.discountPercentage ? (rental * vehicle.discountPercentage) / 100 : 0;
        
        const total = (rental - discAmount) + mFee + dFee + fFee;

        return { totalCost: total, discountAmount: discAmount, baseRentalCost: rental, maticFee: mFee, driverFee: dFee, fuelFee: fFee };
    }, [vehicle, days, service]);

    const handleSubmitOrder = async () => {
        if (!customerName || !customerPhone) {
            toast({
                variant: "destructive",
                title: dictionary.payment.validation.title,
                description: dictionary.payment.validation.description,
            });
            return;
        }

        if (!vehicle || !supabase) return;

        setIsSubmitting(true);
        const orderId = `${vehicle.code.slice(0,3)}${Date.now()}`.toUpperCase();

        const { error } = await supabase.from('orders').insert({
            id: orderId,
            customerName,
            customerPhone,
            carName: `${vehicle.brand} ${vehicle.name}`,
            type: vehicle.type,
            fuel: vehicle.fuel,
            transmission: vehicle.transmission,
            service: service,
            driver: driver?.name || null,
            paymentMethod: paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank',
            status: 'pending',
            total: totalCost,
            driverId: driver?.id,
            vehicleId: vehicle.id
        });

        if (error) {
            toast({ variant: 'destructive', title: "Order Failed", description: error.message });
            setIsSubmitting(false);
            return;
        }
        
        const queryParams = new URLSearchParams({
            id: orderId,
            method: paymentMethod,
            total: totalCost.toString(),
            car: `${vehicle.brand} ${vehicle.name}`,
            period: rentalPeriod,
            ...(driver && { driverName: driver.name }),
            ...(service && { serviceName: service })
        });
        
        router.push(`/validasi/sukses?${queryParams.toString()}`);
    }

    if (isLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    if (!vehicle) {
        return (
             <div className="flex h-full items-center justify-center">
                <Card className="w-full max-w-lg text-center">
                    <CardHeader>
                        <CardTitle>Mobil Tidak Ditemukan</CardTitle>
                        <CardDescription>
                            Mobil yang Anda pilih tidak dapat ditemukan. Silakan kembali dan pilih mobil lain.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Button asChild className="w-full"><Link href="/">Kembali ke Home</Link></Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left Side: Details */}
            <div className="space-y-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>{dictionary.payment.orderSummary.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Image src={vehicle.photo!} alt={vehicle.name} width={120} height={80} className="rounded-lg object-cover" />
                            <div>
                                <h3 className="font-bold text-lg">{vehicle.brand} {vehicle.name}</h3>
                                <p className="text-sm text-muted-foreground">{vehicle.type}</p>
                            </div>
                        </div>
                        <Separator />
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{dictionary.payment.orderSummary.rentalPeriod}</span>
                                <span className="font-medium">{rentalPeriod}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">{dictionary.payment.orderSummary.rentalPrice(days)}</span>
                                <span className="font-medium">{formatCurrency(baseRentalCost)}</span>
                            </div>
                            {driverFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{dictionary.payment.orderSummary.driverFee(days)}</span>
                                    <span className="font-medium">{formatCurrency(driverFee)}</span>
                                </div>
                            )}
                            {fuelFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{dictionary.payment.orderSummary.fuelFee(days)}</span>
                                    <span className="font-medium">{formatCurrency(fuelFee)}</span>
                                </div>
                            )}
                             {maticFee > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">{dictionary.payment.orderSummary.maticFee}</span>
                                    <span className="font-medium">{formatCurrency(maticFee)}</span>
                                </div>
                            )}
                             {discountAmount > 0 && vehicle.discountPercentage && (
                                <div className="flex justify-between text-destructive">
                                    <span className="font-medium">Diskon ({vehicle.discountPercentage}%)</span>
                                    <span>- {formatCurrency(discountAmount)}</span>
                                </div>
                            )}
                        </div>
                         <Separator />
                        <div className="flex justify-between items-baseline text-lg font-bold">
                            <span>{dictionary.payment.orderSummary.totalPayment}</span>
                            <span className="text-primary">{formatCurrency(totalCost)}</span>
                        </div>
                    </CardContent>
                </Card>

                 <Alert className="bg-blue-50 border-blue-200">
                    <ShieldCheck className="h-4 w-4 !text-blue-600" />
                    <AlertTitle className="text-blue-800 font-semibold">{dictionary.payment.attention.title}</AlertTitle>
                    <AlertDescription className="text-blue-700">
                       {dictionary.payment.attention.description}
                    </AlertDescription>
                </Alert>
            </div>

             {/* Right Side: Form */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>{dictionary.payment.personalData.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="fullName">{dictionary.payment.personalData.fullName}</Label>
                            <Input id="fullName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder={dictionary.payment.personalData.fullNamePlaceholder} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">{dictionary.payment.personalData.phone}</Label>
                            <Input id="phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder={dictionary.payment.personalData.phonePlaceholder} type="tel" />
                            <p className="text-xs text-muted-foreground">{dictionary.payment.personalData.phoneHint}</p>
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>{dictionary.payment.paymentMethod.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <Tabs defaultValue="bank" className="w-full" onValueChange={setPaymentMethod}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="bank">{dictionary.payment.paymentMethod.bank.title}</TabsTrigger>
                                <TabsTrigger value="qris">{dictionary.payment.paymentMethod.qris.title}</TabsTrigger>
                            </TabsList>
                            <TabsContent value="bank" className="pt-4">
                                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                                    <div className="flex-shrink-0 flex items-center h-full">
                                        <Logo className="w-8 h-8 text-primary" />
                                    </div>
                                    <div className="text-sm">
                                        <h4 className="font-semibold">{dictionary.payment.paymentMethod.bank.title}</h4>
                                        <p className="text-muted-foreground">{dictionary.payment.paymentMethod.bank.description}</p>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="qris" className="pt-4">
                                <div className="flex items-start gap-4 p-4 border rounded-lg bg-muted/50">
                                    <div className="flex-shrink-0 flex items-center h-full">
                                        <Image src="https://api.qrserver.com/v1/create-qr-code/?size=40x40&data=qris" width={40} height={40} alt="QRIS" data-ai-hint="qr code" />
                                    </div>
                                    <div className="text-sm">
                                        <h4 className="font-semibold">{dictionary.payment.paymentMethod.qris.title}</h4>
                                        <p className="text-muted-foreground">{dictionary.payment.paymentMethod.qris.description}</p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                 <Button className="w-full text-lg h-12" onClick={handleSubmitOrder} disabled={isSubmitting}>
                     {isSubmitting && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
                    {isSubmitting ? "Memproses..." : dictionary.payment.confirmAndPay}
                </Button>
            </div>
        </div>
    )
}


export default function PembayaranPage() {
    const { dictionary } = useLanguage();

    return (
        <div className="container py-12 md:py-16">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold tracking-tight">{dictionary.payment.title}</h1>
                <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">{dictionary.payment.description}</p>
            </div>
            <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary"/></div>}>
                <PaymentForm />
            </Suspense>
        </div>
    )
}
