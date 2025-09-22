'use client';

import { useState, useMemo, useEffect, forwardRef, ChangeEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


import type { Vehicle, Driver, BankAccount } from '@/lib/types';
import { serviceCosts, bankAccounts as initialBankAccounts } from '@/lib/data';
import { Loader2, Copy, Upload, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';
import { format, addDays, differenceInCalendarDays, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { uploadFileAction } from '../actions/upload-actions';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import logos from '@/lib/logo-urls.json';

type BankNameKey = keyof typeof logos;

export default function ConfirmationPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { dictionary, language } = useLanguage();
    const { toast } = useToast();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    // Order Details from URL
    const vehicleId = searchParams.get('vehicleId');
    const days = searchParams.get('days');
    const serviceType = searchParams.get('service');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const driverId = searchParams.get('driverId');

    // State
    const [isLoading, setIsLoading] = useState(true);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [driver, setDriver] = useState<Driver | null>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
    const [selectedBank, setSelectedBank] = useState<BankAccount | null>(bankAccounts[0] || null);

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('bank-transfer');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);
    const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
    const [orderId, setOrderId] = useState<string | null>(null);


     useEffect(() => {
        const supabaseClient = createClient();
        setSupabase(supabaseClient);
    }, []);

    useEffect(() => {
        if (!supabase || !vehicleId) {
            setIsLoading(false);
            return;
        };

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

    }, [supabase, vehicleId, driverId]);


    const duration = useMemo(() => days ? parseInt(days, 10) : 0, [days]);

    const rentalPeriod = useMemo(() => {
        const locale = language === 'id' ? id : undefined;
        if (startDateParam && endDateParam) {
            const start = parseISO(startDateParam);
            const end = parseISO(endDateParam);
            return `${format(start, 'd LLL yyyy', { locale })} - ${format(end, 'd LLL yyyy', { locale })}`;
        }
        return `${duration} ${dictionary.confirmation.days}`;
    }, [startDateParam, endDateParam, duration, language, dictionary.confirmation.days]);


    const { totalCost, baseRentalCost, maticFee, driverFee, fuelFee } = useMemo(() => {
        if (!vehicle || duration <= 0) return { totalCost: 0, baseRentalCost: 0, maticFee: 0, driverFee: 0, fuelFee: 0 };
        const rental = (vehicle.price || 0) * duration;
        const mFee = vehicle.transmission === 'Matic' ? serviceCosts.matic * duration : 0;
        const dFee = (serviceType === 'dengan-supir' || serviceType === 'all-include') ? serviceCosts.driver * duration : 0;
        const fFee = (serviceType === 'all-include') ? serviceCosts.fuel * duration : 0;
        const subtotal = rental + mFee + dFee + fFee;
        const discAmount = vehicle.discountPercentage && vehicle.price
            ? (rental * vehicle.discountPercentage) / 100
            : 0;
        const total = subtotal - discAmount;
        return { totalCost: total, discountAmount: discAmount, baseRentalCost: rental, maticFee: mFee, driverFee: dFee, fuelFee: fFee };
    }, [vehicle, duration, serviceType]);

    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
    
    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            description: `${text} ${dictionary.confirmation.copied}`,
        });
    };
    
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const dataUri = reader.result as string;
                setUploadPreview(dataUri);
                setIsUploading(true);
                try {
                    const publicUrl = await uploadFileAction(dataUri, 'proofs', `order-${orderId}`);
                    setUploadedFileUrl(publicUrl);
                    toast({
                        className: "bg-green-100 border-green-200 text-green-800",
                        title: dictionary.confirmation.upload.success.title,
                        description: dictionary.confirmation.upload.success.description,
                    })
                } catch (error) {
                    toast({ variant: 'destructive', title: dictionary.confirmation.upload.error.title, description: (error as Error).message });
                } finally {
                    setIsUploading(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmOrder = async () => {
        if (!customerName || !customerPhone) {
            toast({
                variant: 'destructive',
                title: dictionary.payment.validation.title,
                description: dictionary.payment.validation.description
            });
            return;
        }
        if (!supabase || !vehicle) return;

        setIsSubmitting(true);
        const newOrder = {
            customerName,
            customerPhone,
            carName: `${vehicle.brand} ${vehicle.name}`,
            transmission: vehicle.transmission,
            fuel: vehicle.fuel,
            type: vehicle.type,
            service: serviceType,
            driver: driver?.name,
            driverId: driver?.id,
            total: totalCost,
            status: 'pending',
            paymentMethod: paymentMethod === 'qris' ? 'QRIS' : 'Transfer Bank',
            paymentProof: uploadedFileUrl,
            vehicleId: vehicle.id,
        };

        const { data, error } = await supabase.from('orders').insert(newOrder).select().single();
        
        if (error) {
            toast({ variant: 'destructive', title: "Gagal membuat pesanan", description: error.message });
            setIsSubmitting(false);
        } else {
            setOrderId(data.id);
            // The user is now on the confirmation screen after submitting details.
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    if (!vehicleId || !days || !serviceType || !vehicle) {
        return (
             <div className="container text-center py-20">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
                <h1 className="mt-4 text-2xl font-bold">{dictionary.confirmation.error.title}</h1>
                <p className="mt-2 text-muted-foreground">{dictionary.confirmation.error.description}</p>
                <Button asChild className="mt-6">
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {dictionary.confirmation.error.backButton}
                    </Link>
                </Button>
            </div>
        )
    }

    // After order is created, show confirmation/payment screen
    if (orderId) {
        return (
            <div className="container max-w-4xl mx-auto py-8 md:py-16">
                 <div className="text-center mb-8">
                     <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                    <h1 className="mt-4 text-4xl font-bold tracking-tight">{dictionary.confirmation.title}</h1>
                    <p className="mt-2 text-lg text-muted-foreground">{dictionary.confirmation.description}</p>
                </div>
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                             <div>
                                <CardTitle>{dictionary.confirmation.orderNumber}</CardTitle>
                                <CardDescription>#{orderId}</CardDescription>
                            </div>
                             <Badge variant="secondary">{dictionary.confirmation.statusAwaitingPayment}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                             <div><span className="font-medium">{dictionary.confirmation.vehicle}:</span> {vehicle.brand} {vehicle.name}</div>
                             <div><span className="font-medium">{dictionary.confirmation.rentalPeriod}:</span> {rentalPeriod}</div>
                             <div><span className="font-medium">{dictionary.confirmation.service}:</span> {serviceType}</div>
                             {driver && <div><span className="font-medium">{dictionary.confirmation.driver}:</span> {driver.name}</div>}
                        </div>
                         <div className="border-t pt-4">
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>{dictionary.confirmation.totalPayment}:</span>
                                <span>{formatCurrency(totalCost)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {paymentMethod === 'bank-transfer' ? (
                     <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>{dictionary.confirmation.paymentInstructions.bank.title}</CardTitle>
                            <CardDescription>{dictionary.confirmation.paymentInstructions.bank.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Select onValueChange={(value) => setSelectedBank(bankAccounts.find(b => b.accountNumber === value) || null)}>
                                <SelectTrigger>
                                    <SelectValue placeholder={dictionary.confirmation.paymentInstructions.bank.selectBank} />
                                </SelectTrigger>
                                <SelectContent>
                                    {bankAccounts.map(b => (
                                        <SelectItem key={b.accountNumber} value={b.accountNumber}>{b.bankName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {selectedBank && (
                                <div className="mt-4 rounded-lg border bg-muted p-4 space-y-2">
                                     <div className="relative h-8 w-16 mb-2">
                                        <Image src={selectedBank.logoUrl} alt={`${selectedBank.bankName} logo`} fill className="object-contain" />
                                    </div>
                                    <p className="font-bold text-lg">{selectedBank.accountNumber} <Button variant="ghost" size="icon" className="h-6 w-6 ml-2" onClick={() => handleCopyToClipboard(selectedBank.accountNumber)}><Copy className="h-4 w-4"/></Button></p>
                                    <p className="text-sm">a.n. {selectedBank.accountName}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card className="mt-6">
                         <CardHeader>
                            <CardTitle>{dictionary.confirmation.paymentInstructions.qris.title}</CardTitle>
                            <CardDescription>{dictionary.confirmation.paymentInstructions.qris.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                             <div className="relative w-56 h-56 mx-auto border rounded-lg p-2">
                                <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Example" alt="QRIS Code" fill className="object-contain" data-ai-hint="qr code"/>
                            </div>
                            <Alert className="mt-4 text-left">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>{dictionary.confirmation.paymentInstructions.qris.important.title}</AlertTitle>
                                <AlertDescription>{dictionary.confirmation.paymentInstructions.qris.important.description}</AlertDescription>
                            </Alert>
                        </CardContent>
                    </Card>
                )}

                 <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>{dictionary.confirmation.upload.title}</CardTitle>
                        <CardDescription>{dictionary.confirmation.upload.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                        {uploadPreview && (
                            <div>
                                <p className="text-sm font-medium mb-2">{dictionary.confirmation.upload.preview}</p>
                                <Image src={uploadPreview} alt="Preview" width={200} height={300} className="rounded-lg mx-auto border" />
                            </div>
                        )}
                        <Label htmlFor="payment-proof" className={cn("cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", "border border-input bg-background hover:bg-accent hover:text-accent-foreground", "h-10 px-4 py-2 w-full")}>
                            {isUploading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {dictionary.confirmation.upload.uploading}</>
                            ) : (
                                <><Upload className="mr-2 h-4 w-4" /> {dictionary.confirmation.upload.selectFile}</>
                            )}
                        </Label>
                        <Input id="payment-proof" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/jpg" disabled={isUploading} />
                        <p className="text-xs text-muted-foreground">{dictionary.confirmation.upload.fileHint}</p>

                         <Button className="w-full" disabled={!uploadedFileUrl || isSubmitting} onClick={handleConfirmOrder}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {dictionary.confirmation.upload.submit}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // Before order is created, show details and ask for personal info
    return (
        <div className="container max-w-4xl mx-auto py-8 md:py-16">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold tracking-tight">{dictionary.payment.title}</h1>
                <p className="mt-2 text-lg text-muted-foreground">{dictionary.payment.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                {/* Left Side - Form */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.payment.personalData.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="space-y-2">
                                <Label htmlFor="name">{dictionary.payment.personalData.fullName}</Label>
                                <Input id="name" placeholder={dictionary.payment.personalData.fullNamePlaceholder} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="phone">{dictionary.payment.personalData.phone}</Label>
                                <Input id="phone" placeholder={dictionary.payment.personalData.phonePlaceholder} value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
                                <p className="text-xs text-muted-foreground">{dictionary.payment.personalData.phoneHint}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                         <CardHeader>
                            <CardTitle>{dictionary.payment.paymentMethod.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup defaultValue="bank-transfer" value={paymentMethod} onValueChange={setPaymentMethod}>
                                <div className="flex items-start space-x-4 p-4 border rounded-md has-[[data-state=checked]]:bg-muted">
                                    <RadioGroupItem value="bank-transfer" id="r-bank" />
                                    <Label htmlFor="r-bank" className="flex-1 cursor-pointer">
                                        <p className="font-semibold">{dictionary.payment.paymentMethod.bank.title}</p>
                                        <p className="text-xs text-muted-foreground">{dictionary.payment.paymentMethod.bank.description}</p>
                                    </Label>
                                </div>
                                <div className="flex items-start space-x-4 p-4 border rounded-md has-[[data-state=checked]]:bg-muted">
                                    <RadioGroupItem value="qris" id="r-qris" />
                                    <Label htmlFor="r-qris" className="flex-1 cursor-pointer">
                                        <p className="font-semibold">{dictionary.payment.paymentMethod.qris.title}</p>
                                        <p className="text-xs text-muted-foreground">{dictionary.payment.paymentMethod.qris.description}</p>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Side - Summary */}
                <div className="space-y-6 sticky top-24">
                     <Card>
                        <CardHeader>
                            <CardTitle>{dictionary.payment.orderSummary.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="font-medium text-muted-foreground">{vehicle.brand} {vehicle.name}</span>
                                <span>{formatCurrency(baseRentalCost)}</span>
                            </div>
                             <div className="flex justify-between text-muted-foreground">
                                <span>{dictionary.payment.orderSummary.rentalPeriod}:</span>
                                <span>{rentalPeriod}</span>
                            </div>
                            {maticFee > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{dictionary.payment.orderSummary.maticFee}:</span>
                                    <span>{formatCurrency(maticFee)}</span>
                                </div>
                            )}
                            {driverFee > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{dictionary.payment.orderSummary.driverFee(duration)}:</span>
                                    <span>{formatCurrency(driverFee)}</span>
                                </div>
                            )}
                            {fuelFee > 0 && (
                                <div className="flex justify-between text-muted-foreground">
                                    <span>{dictionary.payment.orderSummary.fuelFee(duration)}:</span>
                                    <span>{formatCurrency(fuelFee)}</span>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-4">
                            <div className="flex justify-between font-bold text-lg border-t pt-4">
                                <span>{dictionary.payment.orderSummary.totalPayment}</span>
                                <span className="text-primary">{formatCurrency(totalCost)}</span>
                            </div>
                            <Button className="w-full" onClick={handleConfirmOrder} disabled={isSubmitting}>
                                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                {dictionary.payment.confirmAndPay}
                            </Button>
                        </CardFooter>
                    </Card>
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{dictionary.payment.attention.title}</AlertTitle>
                        <AlertDescription>{dictionary.payment.attention.description}</AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
}
