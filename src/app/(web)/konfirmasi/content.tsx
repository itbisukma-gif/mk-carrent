
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, BankAccount, Vehicle } from '@/lib/types';

import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Copy, Loader2, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { bankAccounts as initialBankAccounts } from '@/lib/data';
import { addDays, format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function ConfirmationPageContent() {
    const { dictionary, language } = useLanguage();
    const { toast } = useToast();
    const searchParams = useSearchParams();

    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [vehicle, setVehicle] = useState<Vehicle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // States for upload logic
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const orderId = searchParams.get('orderId');

    const locale = language === 'id' ? id : undefined;

    useEffect(() => {
        const client = createClient();
        setSupabase(client);
    }, []);

    useEffect(() => {
        if (!supabase || !orderId) {
            setIsLoading(false);
            return;
        };

        const fetchOrderDetails = async () => {
            setIsLoading(true);
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (orderError || !orderData) {
                toast({ variant: 'destructive', title: "Pesanan Tidak Ditemukan" });
                setOrder(null);
            } else {
                setOrder(orderData);
                const { data: vehicleData } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('id', orderData.vehicleId)
                    .single();
                setVehicle(vehicleData);
            }
            setIsLoading(false);
        };
        fetchOrderDetails();
    }, [supabase, orderId, toast]);

    const rentalPeriodString = useMemo(() => {
        const startDateStr = searchParams.get('startDate');
        const endDateStr = searchParams.get('endDate');

        if (startDateStr && endDateStr) {
            const start = parseISO(startDateStr);
            const end = parseISO(endDateStr);
            return `${format(start, 'd LLL y', { locale })} - ${format(end, 'd LLL y', { locale })}`;
        }
        
        const days = searchParams.get('days');
        if (days) {
            return `${days} ${dictionary.confirmation.days}`;
        }
        
        return dictionary.confirmation.invalidPeriod;
    }, [searchParams, dictionary, locale]);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: dictionary.confirmation.copied,
            description: `Nomor ${text} telah disalin.`,
        });
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast({ variant: 'destructive', title: 'Ukuran file terlalu besar', description: 'Maksimal 5MB.'});
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleUpload = async () => {
        if (!previewUrl || !orderId || !supabase) return;
        setIsUploading(true);

        try {
            // This would be an action
            const actionModule = await import('@/app/actions/upload-actions');
            const publicUrl = await actionModule.uploadFileAction(previewUrl, 'proofs', `order-${orderId}`);

            const { error: updateError } = await supabase
                .from('orders')
                .update({ paymentProof: publicUrl })
                .eq('id', orderId);

            if (updateError) throw updateError;
            
            setUploadSuccess(true);
            toast({ title: dictionary.confirmation.upload.success.title });

        } catch (error) {
            console.error(error);
            toast({ variant: 'destructive', title: dictionary.confirmation.upload.error.title, description: (error as Error).message });
        } finally {
            setIsUploading(false);
        }
    }


    if (isLoading) {
        return (
            <div className="container py-16 text-center">
                <Loader2 className="mx-auto h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (!order) {
        return (
            <div className="container text-center py-20 max-w-lg">
                <h2 className="text-2xl font-bold">{dictionary.confirmation.error.title}</h2>
                <p className="text-muted-foreground mt-2">{dictionary.confirmation.error.description}</p>
                <Button asChild className="mt-6">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" />{dictionary.confirmation.error.backButton}</Link>
                </Button>
            </div>
        );
    }
    
    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);


    return (
        <div className="container max-w-4xl py-8 md:py-16">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">{dictionary.confirmation.title}</CardTitle>
                    <CardDescription>{dictionary.confirmation.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="border rounded-lg p-4 space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">{dictionary.confirmation.orderNumber}</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-medium text-base">{order.id}</span>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => copyToClipboard(order.id)}>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">{dictionary.confirmation.status}</span>
                            <Badge variant="secondary">{dictionary.confirmation.statusAwaitingPayment}</Badge>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {vehicle && (
                             <div className="flex items-start gap-4">
                                <Image src={vehicle.photo} alt={vehicle.name} width={120} height={80} className="rounded-lg object-cover aspect-video" />
                                <div className="space-y-1">
                                    <h4 className="font-semibold">{dictionary.confirmation.vehicle}</h4>
                                    <p className="text-sm text-muted-foreground">{vehicle.brand} {vehicle.name}</p>
                                    <p className="text-xs text-muted-foreground">{vehicle.transmission}</p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <h4 className="font-semibold">{dictionary.confirmation.rentalPeriod}</h4>
                            <p className="text-sm text-muted-foreground">{rentalPeriodString}</p>
                        </div>
                         <div className="space-y-1">
                            <h4 className="font-semibold">{dictionary.confirmation.service}</h4>
                            <p className="text-sm text-muted-foreground">{order.service}</p>
                        </div>
                        {order.driver && (
                            <div className="space-y-1">
                                <h4 className="font-semibold">{dictionary.confirmation.driver}</h4>
                                <p className="text-sm text-muted-foreground">{order.driver}</p>
                            </div>
                        )}
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>{dictionary.confirmation.totalPayment}</span>
                        <span className="text-primary">{formatCurrency(order.total || 0)}</span>
                    </div>

                </CardContent>
            </Card>

            <Card className="mt-8">
                 <CardHeader>
                    <CardTitle>{dictionary.confirmation.paymentInstructions.bank.title}</CardTitle>
                    <CardDescription>{dictionary.confirmation.paymentInstructions.bank.description}</CardDescription>
                </CardHeader>
                 <CardContent>
                     {initialBankAccounts.map((account) => (
                        <div key={account.accountNumber} className="border rounded-lg p-4 flex justify-between items-center mb-4">
                            <div className="flex items-center gap-4">
                                <Image src={account.logoUrl} alt={account.bankName} width={80} height={25} className="object-contain" />
                                <div>
                                    <p className="font-semibold text-lg">{account.accountNumber}</p>
                                    <p className="text-sm text-muted-foreground">a.n. {account.accountName}</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => copyToClipboard(account.accountNumber)}>
                                {dictionary.confirmation.copy}
                            </Button>
                        </div>
                    ))}
                 </CardContent>
            </Card>

            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>{dictionary.confirmation.upload.title}</CardTitle>
                    <CardDescription>{dictionary.confirmation.upload.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {uploadSuccess ? (
                        <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                             <h3 className="text-lg font-semibold text-green-800">{dictionary.confirmation.upload.success.title}</h3>
                            <p className="text-sm text-green-700 mt-1">{dictionary.confirmation.upload.success.description}</p>
                            <Button asChild className="mt-4" size="sm">
                                <Link href="https://wa.me/your-whatsapp-number" target="_blank">
                                    {dictionary.confirmation.upload.success.contactAdmin}
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                             {previewUrl && (
                                <div>
                                    <Label>{dictionary.confirmation.upload.preview}</Label>
                                    <div className="mt-2 relative aspect-video w-full max-w-sm border rounded-lg overflow-hidden">
                                        <Image src={previewUrl} alt="Pratinjau Bukti Bayar" fill className="object-contain" />
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="payment-proof-upload" 
                                    className={cn("w-full cursor-pointer", 
                                        "flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 text-center",
                                        "hover:bg-accent transition-colors"
                                    )}>
                                    <Upload className="h-8 w-8 text-muted-foreground" />
                                    <span className="font-medium text-primary">{dictionary.confirmation.upload.selectFile}</span>
                                    <span className="text-xs text-muted-foreground">{dictionary.confirmation.upload.fileHint}</span>
                                </Label>
                                <Input id="payment-proof-upload" type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                            </div>
                            <Button onClick={handleUpload} disabled={!previewUrl || isUploading} className="w-full">
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isUploading ? dictionary.confirmation.upload.uploading : dictionary.confirmation.upload.submit}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

    