'use client';

import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from '@/hooks/use-language';
import type { Vehicle, Driver, BankAccount, Order } from '@/lib/types';
import { bankAccounts, serviceCosts } from '@/lib/data';
import logos from '@/lib/logo-urls.json';
import { Copy, AlertTriangle, ArrowLeft, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadFileAction } from '@/app/actions/upload-actions';
import { addDays, format, differenceInCalendarDays, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

type BankNameKey = keyof typeof logos;

export default function ConfirmationPageContent() {
    const { dictionary, language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'qris'>('bank');
    const [selectedBank, setSelectedBank] = useState<BankAccount | null>(bankAccounts[0]);

    // For file upload
    const [paymentProof, setPaymentProof] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
    

    const vehicleId = searchParams.get('vehicleId');
    const days = parseInt(searchParams.get('days') || '0', 10);
    const service = searchParams.get('service');
    const driverId = searchParams.get('driverId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const startDate = startDateStr ? parseISO(startDateStr) : new Date();
    const endDate = endDateStr ? parseISO(endDateStr) : addDays(new Date(), days || 1);
    
    const duration = useMemo(() => {
        if (startDateStr && endDateStr) {
            return differenceInCalendarDays(parseISO(endDateStr), parseISO(startDateStr)) || 1;
        }
        return days > 0 ? days : 1;
    }, [startDateStr, endDateStr, days]);


    useEffect(() => {
        const client = createClient();
        setSupabase(client);
    }, []);

    useEffect(() => {
        if (!supabase || !vehicleId) {
            setIsLoading(false);
            return;
        };

        const fetchData = async () => {
            setIsLoading(true);
            const { data: vehicleData, error: vehicleError } = await supabase
                .from('vehicles')
                .select('*')
                .eq('id', vehicleId)
                .single();

            if (vehicleError) toast({ variant: 'destructive', title: 'Gagal mengambil data kendaraan' });
            else setVehicle(vehicleData);

            if (driverId) {
                 const { data: driverData, error: driverError } = await supabase
                    .from('drivers')
                    .select('*')
                    .eq('id', driverId)
                    .single();
                if (driverError) toast({ variant: 'destructive', title: 'Gagal mengambil data supir' });
                else setDriver(driverData);
            }
            setIsLoading(false);
        };
        fetchData();

    }, [supabase, vehicleId, driverId, toast]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
    
    const { totalCost, maticFee, driverFee, fuelFee, baseRentalCost } = useMemo(() => {
        if (!vehicle || duration <= 0) {
            return { totalCost: 0, maticFee: 0, driverFee: 0, fuelFee: 0, baseRentalCost: 0 };
        }
        
        const rental = (vehicle.price || 0) * duration;
        const mFee = vehicle.transmission === 'Matic' ? serviceCosts.matic * duration : 0;
        const dFee = (service === 'dengan-supir' || service === 'all-include') ? serviceCosts.driver * duration : 0;
        const fFee = (service === 'all-include') ? serviceCosts.fuel * duration : 0;
        const subtotal = rental + mFee + dFee + fFee;
        const discAmount = vehicle.discountPercentage && vehicle.price ? (rental * vehicle.discountPercentage) / 100 : 0;
        
        return {
            totalCost: subtotal - discAmount,
            maticFee: mFee,
            driverFee: dFee,
            fuelFee: fFee,
            baseRentalCost: rental,
        };
    }, [vehicle, duration, service]);

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: dictionary.confirmation.copied });
    };
    
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setPreviewUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUpload = async () => {
        if (!previewUrl || !createdOrder) return;
        setIsUploading(true);
        try {
            const uploadedUrl = await uploadFileAction(previewUrl, 'proofs', `order-${createdOrder.id}`);
            
            if (supabase) {
                const { error } = await supabase
                    .from('orders')
                    .update({ paymentProof: uploadedUrl })
                    .eq('id', createdOrder.id);
                if (error) throw error;
            }
            
            setPaymentProof(uploadedUrl);
            setUploadSuccess(true);
            toast({ title: dictionary.confirmation.upload.success.title, description: dictionary.confirmation.upload.success.description });
        } catch (error) {
            toast({ variant: 'destructive', title: dictionary.confirmation.upload.error.title, description: (error as Error).message });
        } finally {
            setIsUploading(false);
        }
    };

    const handleCreateOrder = async () => {
        if (!customerName || !customerPhone) {
            toast({ variant: 'destructive', title: dictionary.payment.validation.title, description: dictionary.payment.validation.description });
            return;
        }
        if (!supabase || !vehicle) return;

        setIsSubmitting(true);
        const orderData = {
            customerName,
            customerPhone,
            carName: `${vehicle.brand} ${vehicle.name}`,
            type: vehicle.type,
            fuel: vehicle.fuel,
            transmission: vehicle.transmission,
            service: service,
            driver: driver?.name || null,
            paymentMethod: paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank',
            total: totalCost,
            status: 'pending',
            vehicleId: vehicle.id,
            driverId: driver?.id || null,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        const { data, error } = await supabase.from('orders').insert(orderData).select().single();
        
        if (error) {
            toast({ variant: 'destructive', title: 'Gagal membuat pesanan', description: error.message });
        } else {
            setCreatedOrder(data as Order);
            toast({ title: 'Pesanan Dibuat', description: 'Silakan lanjutkan ke pembayaran.' });
        }
        setIsSubmitting(false);
    };

    if (!vehicleId || !service || duration <= 0) {
        return (
            <div className="container py-16 text-center">
                 <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h1 className="mt-4 text-2xl font-bold">{dictionary.confirmation.error.title}</h1>
                <p className="mt-2 text-muted-foreground">{dictionary.confirmation.error.description}</p>
                 <Button asChild className="mt-6">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> {dictionary.confirmation.error.backButton}</Link>
                </Button>
            </div>
        );
    }
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-10 w-10 animate-spin" /></div>
    }

    if (!vehicle) {
         return <div className="flex items-center justify-center h-screen"><p>Kendaraan tidak ditemukan.</p></div>
    }

    const locale = language === 'id' ? localeId : undefined;
    const rentalPeriodString = `${format(startDate, 'd MMM yyyy', { locale })} - ${format(endDate, 'd MMM yyyy', { locale })}`;

    if (createdOrder) {
        return (
            <div className="container py-8 md:py-16 max-w-3xl mx-auto">
                 <Card>
                    <CardHeader className="text-center">
                        <h1 className="text-3xl font-bold tracking-tight">{dictionary.confirmation.title}</h1>
                        <p className="text-muted-foreground">{dictionary.confirmation.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="border rounded-lg p-4 space-y-2">
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{dictionary.confirmation.orderNumber}</span>
                                <span className="font-mono font-medium">{createdOrder.id}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{dictionary.confirmation.vehicle}</span>
                                <span className="font-medium">{createdOrder.carName}</span>
                            </div>
                             <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{dictionary.confirmation.rentalPeriod}</span>
                                <span className="font-medium">{rentalPeriodString} ({duration} {dictionary.confirmation.days})</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">{dictionary.confirmation.service}</span>
                                <span className="font-medium">{createdOrder.service}</span>
                            </div>
                            {createdOrder.driver && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{dictionary.confirmation.driver}</span>
                                    <span className="font-medium">{createdOrder.driver}</span>
                                </div>
                            )}
                             <div className="flex justify-between text-sm font-bold pt-2 border-t mt-2">
                                <span>{dictionary.confirmation.totalPayment}</span>
                                <span>{formatCurrency(createdOrder.total || 0)}</span>
                            </div>
                        </div>

                        {paymentMethod === 'bank' && (
                            <div className="space-y-4">
                                <h3 className="font-semibold">{dictionary.confirmation.paymentInstructions.bank.title}</h3>
                                <p className="text-sm text-muted-foreground">{dictionary.confirmation.paymentInstructions.bank.description}</p>
                                <RadioGroup onValueChange={(value) => setSelectedBank(bankAccounts.find(b => b.bankName === value) || null)}>
                                    {bankAccounts.map((bank) => (
                                        <div key={bank.bankName} className="flex items-center space-x-2">
                                            <RadioGroupItem value={bank.bankName} id={bank.bankName} />
                                            <Label htmlFor={bank.bankName} className="flex items-center gap-2">
                                                <Image src={bank.logoUrl} alt={bank.bankName} width={60} height={20} className="object-contain" />
                                            </Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                                {selectedBank && (
                                     <Card className="bg-muted/50">
                                        <CardContent className="p-4 space-y-2">
                                            <p className="text-sm text-muted-foreground">a.n. {selectedBank.accountName}</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-lg font-bold tracking-wider">{selectedBank.accountNumber}</p>
                                                <Button size="sm" variant="ghost" onClick={() => handleCopyToClipboard(selectedBank.accountNumber)}>
                                                    <Copy className="h-4 w-4 mr-2" />
                                                    {dictionary.confirmation.copy}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {paymentMethod === 'qris' && (
                             <div className="space-y-4">
                                <h3 className="font-semibold">{dictionary.confirmation.paymentInstructions.qris.title}</h3>
                                <p className="text-sm text-muted-foreground">{dictionary.confirmation.paymentInstructions.qris.description}</p>
                                <div className="flex justify-center">
                                    <div className="relative w-48 h-48 border rounded-md p-2">
                                        <Image src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Example" alt="QRIS Code" fill className="object-contain" data-ai-hint="qr code"/>
                                    </div>
                                </div>
                                <div className="text-center text-xs text-muted-foreground p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                                    <p className="font-bold">{dictionary.confirmation.paymentInstructions.qris.important.title}</p>
                                    <p>{dictionary.confirmation.paymentInstructions.qris.important.description}</p>
                                </div>
                            </div>
                        )}

                        <div className="border-t pt-6 space-y-4">
                             <h3 className="font-semibold">{dictionary.confirmation.upload.title}</h3>
                             {uploadSuccess ? (
                                <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
                                    <h4 className="font-bold text-green-800">{dictionary.confirmation.upload.success.title}</h4>
                                    <p className="text-sm text-green-700 mt-1">{dictionary.confirmation.upload.success.description}</p>
                                    <Button size="sm" className="mt-4" asChild><Link href="/">Kembali ke Home</Link></Button>
                                </div>
                             ) : (
                                <>
                                <p className="text-sm text-muted-foreground">{dictionary.confirmation.upload.description}</p>
                                {previewUrl && (
                                    <div className="space-y-2">
                                        <Label>{dictionary.confirmation.upload.preview}</Label>
                                        <div className="relative aspect-video w-full max-w-sm mx-auto rounded-md overflow-hidden border">
                                            <Image src={previewUrl} alt="Pratinjau Bukti Bayar" fill className="object-cover" />
                                        </div>
                                    </div>
                                )}
                                <Label htmlFor="payment-proof-upload" className={cn("w-full cursor-pointer", "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", "border border-input bg-background hover:bg-accent hover:text-accent-foreground", "h-10 px-4 py-2")}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {previewUrl ? 'Ganti File...' : dictionary.confirmation.upload.selectFile}
                                </Label>
                                <Input id="payment-proof-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                                <p className="text-xs text-muted-foreground text-center">{dictionary.confirmation.upload.fileHint}</p>
                                <Button className="w-full" onClick={handleUpload} disabled={!previewUrl || isUploading}>
                                    {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isUploading ? dictionary.confirmation.upload.uploading : dictionary.confirmation.upload.submit}
                                </Button>
                                </>
                             )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container py-8 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
                {/* Personal Data & Payment Method */}
                <div className="space-y-8">
                     <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.payment.personalData.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullName">{dictionary.payment.personalData.fullName}</Label>
                                <Input id="fullName" placeholder={dictionary.payment.personalData.fullNamePlaceholder} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{dictionary.payment.personalData.phone}</Label>
                                <Input id="phone" type="tel" placeholder={dictionary.payment.personalData.phonePlaceholder} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                                <p className="text-xs text-muted-foreground">{dictionary.payment.personalData.phoneHint}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.payment.paymentMethod.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="bank" onValueChange={(value: 'bank' | 'qris') => setPaymentMethod(value)}>
                                <Label htmlFor="bank" className="flex items-start space-x-4 p-4 rounded-md border has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors cursor-pointer">
                                    <RadioGroupItem value="bank" id="bank" />
                                    <div className="space-y-1">
                                        <p className="font-medium">{dictionary.payment.paymentMethod.bank.title}</p>
                                        <p className="text-sm text-muted-foreground">{dictionary.payment.paymentMethod.bank.description}</p>
                                    </div>
                                </Label>
                                <Label htmlFor="qris" className="flex items-start space-x-4 p-4 rounded-md border has-[:checked]:bg-muted has-[:checked]:border-primary transition-colors cursor-pointer">
                                    <RadioGroupItem value="qris" id="qris" />
                                    <div className="space-y-1">
                                        <p className="font-medium">{dictionary.payment.paymentMethod.qris.title}</p>
                                        <p className="text-sm text-muted-foreground">{dictionary.payment.paymentMethod.qris.description}</p>
                                    </div>
                                </Label>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Order Summary */}
                <div>
                     <Card className="sticky top-20">
                        <CardHeader>
                             <CardTitle>{dictionary.payment.orderSummary.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Image src={vehicle.photo} alt={vehicle.name} width={100} height={60} className="rounded-md object-cover" />
                                <div>
                                    <h3 className="font-semibold">{vehicle.brand} {vehicle.name}</h3>
                                    <p className="text-sm text-muted-foreground">{rentalPeriodString}</p>
                                </div>
                            </div>
                            <div className="space-y-2 border-t pt-4 text-sm">
                                 <div className="flex justify-between">
                                    <span className="text-muted-foreground">{dictionary.payment.orderSummary.rentalPrice(duration)}</span>
                                    <span>{formatCurrency(baseRentalCost)}</span>
                                </div>
                                {driverFee > 0 && (
                                   <div className="flex justify-between">
                                        <span className="text-muted-foreground">{dictionary.payment.orderSummary.driverFee(duration)}</span>
                                        <span>{formatCurrency(driverFee)}</span>
                                   </div>
                                )}
                                {fuelFee > 0 && (
                                   <div className="flex justify-between">
                                        <span className="text-muted-foreground">{dictionary.payment.orderSummary.fuelFee(duration)}</span>
                                        <span>{formatCurrency(fuelFee)}</span>
                                   </div>
                                )}
                                {maticFee > 0 && (
                                   <div className="flex justify-between">
                                        <span className="text-muted-foreground">{dictionary.payment.orderSummary.maticFee}</span>
                                        <span>{formatCurrency(maticFee)}</span>
                                   </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-4">
                            <div className="flex justify-between font-bold text-lg pt-4 border-t">
                                <span>{dictionary.payment.orderSummary.totalPayment}</span>
                                <span>{formatCurrency(totalCost)}</span>
                            </div>
                             <Button onClick={handleCreateOrder} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? "Memproses..." : dictionary.payment.confirmAndPay}
                            </Button>
                             <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
                                <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                                <p>{dictionary.payment.attention.description}</p>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}