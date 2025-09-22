
'use client'

import { Suspense, useEffect, useState, ChangeEvent, useMemo, SVGProps } from "react";
import { useSearchParams, notFound, useRouter } from 'next/navigation'
import Link from "next/link";
import Image from "next/image";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CheckCircle, Banknote, ClipboardCopy, Upload, AlertCircle, ArrowLeft, Paperclip, Phone, FileCheck } from "lucide-react";
import { bankAccounts, fleet } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useLanguage } from "@/hooks/use-language";
import { LanguageProvider } from "@/app/language-provider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BankAccount } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

function BankAccountDetails({ bank }: { bank: BankAccount }) {
    const { dictionary } = useLanguage();
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(bank.accountNumber);
        setCopied(true);
        toast({
            title: "Berhasil Disalin",
            description: "Nomor rekening telah disalin ke clipboard.",
        });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
         <div className="flex justify-between items-center p-4 bg-muted/50 rounded-md mt-4 border">
            <div className="flex items-center gap-4">
                 <div className="relative h-8 w-12">
                    <Image src={bank.logoUrl} alt={`${bank.bankName} logo`} fill className="object-contain" />
                 </div>
                 <div>
                    <p className="font-semibold">{bank.bankName}</p>
                    <p className="font-mono text-base">{bank.accountNumber}</p>
                    <p className="text-sm text-muted-foreground">a.n. {bank.accountName}</p>
                </div>
            </div>
             <button
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-primary px-3 py-1.5"
            >
                <ClipboardCopy className="h-4 w-4 mr-2" />
                {copied ? dictionary.confirmation.copied : dictionary.confirmation.copy}
            </button>
        </div>
    );
}

// SIMULATED UPLOAD FUNCTION
// In a real app, this would be an API call to a serverless function
// that uploads the file to Firebase Storage.
async function uploadFile(file: File): Promise<string> {
    console.log(`[UPLOAD_START] Memulai upload untuk file: ${file.name}, ukuran: ${file.size} bytes`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulate a potential error (e.g., file too large, invalid type)
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error("Ukuran file terlalu besar. Maksimal 5MB.");
    }

    // Simulate successful upload and return a fake URL
    const fakeUrl = URL.createObjectURL(file);
    console.log(`[UPLOAD_SUCCESS] File berhasil di-upload. URL Lokal: ${fakeUrl}`);
    return fakeUrl;
}


function UploadProof({ onUploadSuccess, isBankTransfer, isBankSelected }: { onUploadSuccess: () => void, isBankTransfer: boolean, isBankSelected: boolean }) {
    const { dictionary } = useLanguage();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');


    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setUploadState('idle');
            setErrorMessage('');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        
        setUploadState('uploading');
        setErrorMessage('');
        console.log("[HANDLE_UPLOAD] Tombol kirim ditekan. Memanggil fungsi uploadFile...");

        try {
            await uploadFile(selectedFile);
            setUploadState('success');
            console.log('[HANDLE_UPLOAD_SUCCESS] Proses upload selesai tanpa error.');
            onUploadSuccess(); 

        } catch (error) {
            console.error("[HANDLE_UPLOAD_ERROR] Terjadi error saat meng-upload file:", error);
            const message = error instanceof Error ? error.message : "Terjadi kesalahan tidak diketahui.";
            setErrorMessage(message);
            setUploadState('error');
        }
    };

    const isSubmitDisabled = !selectedFile || uploadState === 'uploading' || (isBankTransfer && !isBankSelected);
    
    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>{dictionary.confirmation.upload.title}</CardTitle>
                <CardDescription>
                    {dictionary.confirmation.upload.description}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 
                 {uploadState === 'error' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{dictionary.confirmation.upload.error.title}</AlertTitle>
                        <AlertDescription>
                            {errorMessage}
                        </AlertDescription>
                    </Alert>
                 )}

                <div className="flex flex-wrap items-center gap-2">
                    <Label htmlFor="proof-upload" className={cn(buttonVariants({ variant: "outline" }), "cursor-pointer")}>
                        <Paperclip className="h-4 w-4 mr-2" />
                        Pilih File
                    </Label>
                    <Button onClick={handleUpload} disabled={isSubmitDisabled}>
                        {uploadState === 'uploading' ? dictionary.confirmation.upload.uploading : dictionary.confirmation.upload.submit}
                    </Button>
                </div>
                <Input
                    id="proof-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept="image/png,image/jpeg"
                    className="hidden"
                />

                {previewUrl && selectedFile && (
                    <div className="mt-4 border rounded-md p-3">
                        <p className="text-sm font-medium mb-2">{dictionary.confirmation.upload.preview}</p>
                         <div className="relative aspect-video max-h-64 w-full mx-auto">
                           <Image
                                src={previewUrl}
                                alt={`${dictionary.confirmation.upload.preview} ${selectedFile.name}`}
                                fill
                                className="rounded-md object-contain"
                            />
                         </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">{selectedFile.name}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function KonfirmasiComponent() {
    const { dictionary, language } = useLanguage();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [uploadSuccess, setUploadSuccess] = useState(false);
    
    // Get all params from URL
    const paymentMethod = searchParams.get('paymentMethod');
    const total = searchParams.get('total');
    const vehicleId = searchParams.get('vehicleId');
    const service = searchParams.get('service');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const discount = searchParams.get('discount');
    const maticFee = searchParams.get('maticFee');
    const customerName = searchParams.get('name');
    const customerPhone = searchParams.get('phone');

    const vehicle = fleet.find(v => v.id === vehicleId);
    
    const [orderId, setOrderId] = useState('');
    const [selectedBankId, setSelectedBankId] = useState<string | undefined>(undefined);

    const selectedBank = useMemo(() => {
        return bankAccounts.find(bank => bank.accountNumber === selectedBankId);
    }, [selectedBankId]);


    useEffect(() => {
        // This should only run on the client-side to avoid hydration mismatch
        const randomOrderId = `ORD-${Math.floor(Math.random() * 90000) + 10000}`;
        setOrderId(randomOrderId);
    }, []);

    const rentalPeriod = useMemo(() => {
        if (startDateStr && endDateStr) {
            try {
                const start = parseISO(startDateStr);
                const end = parseISO(endDateStr);
                const locale = language === 'id' ? id : undefined;
                return `${format(start, 'd LLL yy', { locale })} - ${format(end, 'd LLL yy', { locale })}`;
            } catch (error) {
                console.error("Error parsing date strings:", error);
                return dictionary.confirmation.invalidPeriod;
            }
        }
        const days = searchParams.get('days') || '1';
        return `${days} ${dictionary.confirmation.days}`;
    }, [startDateStr, endDateStr, searchParams, dictionary, language]);

    if (!vehicleId || !vehicle || !total || !service || !paymentMethod || !customerName || !customerPhone) {
        return (
             <div className="container mx-auto max-w-lg py-8 md:py-12 px-4">
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{dictionary.confirmation.error.title}</AlertTitle>
                    <AlertDescription>
                        <p>{dictionary.confirmation.error.description}</p>
                         <Button asChild className="mt-4 w-full">
                            <Link href="/">{dictionary.confirmation.error.backButton}</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
             </div>
        )
    }

    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);

    if (uploadSuccess) {
        return (
            <div className="container mx-auto max-w-lg py-8 md:py-12 px-4">
                 <Card>
                    <CardContent className="p-6 md:p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-2xl md:text-3xl font-bold">{dictionary.confirmation.upload.success.title}</h1>
                        <p className="text-muted-foreground mt-2">{dictionary.confirmation.upload.success.description}</p>
                        
                         <div className="text-left bg-muted/30 rounded-lg p-4 mt-6 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{dictionary.confirmation.orderNumber}:</span>
                                <span className="font-mono font-semibold">{orderId || '...'}</span>
                            </div>
                            <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">{dictionary.confirmation.vehicle}:</span>
                                <span className="font-semibold">{vehicle.brand} {vehicle.name}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">{dictionary.confirmation.rentalPeriod}:</span>
                                <span className="font-semibold">{rentalPeriod}</span>
                            </div>
                             <div className="flex justify-between items-baseline">
                                <span className="text-muted-foreground">{dictionary.confirmation.totalPayment}:</span>
                                <span className="font-semibold text-primary">{total ? formatCurrency(Number(total)) : '-'}</span>
                            </div>
                            {paymentMethod === 'bank' && selectedBank ? (
                                 <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Transfer Ke:</span>
                                    <div className="flex items-center gap-2">
                                        <div className="relative h-6 w-10">
                                            <Image src={selectedBank.logoUrl} alt={`${selectedBank.bankName} logo`} fill className="object-contain" />
                                        </div>
                                        <span className="font-semibold">{selectedBank.bankName}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Metode Pembayaran:</span>
                                    <span className="font-semibold capitalize">QRIS</span>
                                </div>
                            )}
                        </div>

                         <div className="mt-8 flex justify-between gap-4">
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <p className="text-sm font-medium">{dictionary.backToHome}</p>
                                <Button asChild className="w-full">
                                    <Link href="/">
                                        <ArrowLeft className="h-5 w-5" /> 
                                    </Link>
                                </Button>
                            </div>
                            <div className="flex flex-1 flex-col items-center gap-2">
                                <p className="text-sm font-medium">{dictionary.confirmation.upload.success.contactAdmin}</p>
                                <Button asChild className="w-full">
                                    <Link href="https://wa.me/6281234567890" target="_blank">
                                        <Phone className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>
                         </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto max-w-lg py-8 md:py-12 px-4">
                <Button variant="ghost" onClick={() => router.back()} className="mb-6 -ml-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali
                </Button>
                <Card className="w-full">
                    <CardContent className="p-6 md:p-8 text-center">
                        <Banknote className="h-16 w-16 text-primary mx-auto mb-4" />
                        <h1 className="text-2xl md:text-3xl font-bold">Selesaikan Pembayaran</h1>
                        <p className="text-muted-foreground mt-2">{dictionary.confirmation.description}</p>

                        <div className="text-left bg-muted/30 rounded-lg p-4 mt-6 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{dictionary.confirmation.orderNumber}:</span>
                                <span className="font-mono text-sm font-semibold">{orderId || '...' }</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{dictionary.confirmation.status}:</span>
                                <span className="font-semibold text-sm text-yellow-600">{dictionary.confirmation.statusAwaitingPayment}</span>
                            </div>
                            <Separator className="my-1"/>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{dictionary.confirmation.vehicle}:</span>
                                <span className="font-semibold text-sm">{vehicle.brand} {vehicle.name}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{dictionary.confirmation.rentalPeriod}:</span>
                                <span className="font-semibold text-sm">{rentalPeriod}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{dictionary.confirmation.service}:</span>
                                <span className="font-semibold text-sm capitalize">{service?.replace('-', ' ')}</span>
                            </div>
                            {maticFee && Number(maticFee) > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Biaya Tambahan Matic</span>
                                    <span className="font-semibold text-sm">{formatCurrency(Number(maticFee))}</span>
                                </div>
                            )}
                            {discount && Number(discount) > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span className="text-sm font-medium">Diskon</span>
                                    <span className="font-semibold text-sm">- {formatCurrency(Number(discount))}</span>
                                </div>
                            )}
                             <Separator className="my-1"/>
                             <div className="flex justify-between items-baseline">
                                <span className="text-sm text-muted-foreground">{dictionary.confirmation.totalPayment}:</span>
                                <span className="font-semibold text-xl text-primary">{total ? formatCurrency(Number(total)) : '-'}</span>
                            </div>
                        </div>
                        
                        <Separator className="my-6" />

                        {paymentMethod === 'bank' ? (
                            <div className="text-left">
                                <h2 className="font-semibold text-lg mb-3">{dictionary.confirmation.paymentInstructions.bank.title}</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {dictionary.confirmation.paymentInstructions.bank.description}
                                </p>
                                <div className="space-y-3">
                                    <Select onValueChange={setSelectedBankId} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder={dictionary.confirmation.paymentInstructions.bank.selectBank} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {bankAccounts.map(acc => (
                                                <SelectItem key={acc.accountNumber} value={acc.accountNumber}>
                                                    {acc.bankName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedBank && <BankAccountDetails bank={selectedBank} />}
                                </div>
                            </div>
                        ) : (
                             <div className="text-left">
                                <h2 className="font-semibold text-lg mb-3">{dictionary.confirmation.paymentInstructions.qris.title}</h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {dictionary.confirmation.paymentInstructions.qris.description}
                                </p>
                                <div className="flex justify-center my-4">
                                    {orderId && total && (
                                        <Image 
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=AUTORENT-PAYMENT-${orderId}-${total}`}
                                            width={200}
                                            height={200}
                                            alt="QRIS Payment Code"
                                            data-ai-hint="QR code"
                                        />
                                    )}
                                </div>
                                 <Alert>
                                    <AlertTitle>{dictionary.confirmation.paymentInstructions.qris.important.title}</AlertTitle>
                                    <AlertDescription>
                                        {dictionary.confirmation.paymentInstructions.qris.important.description}
                                    </AlertDescription>
                                </Alert>
                             </div>
                        )}
                    </CardContent>
                </Card>

                <UploadProof 
                    onUploadSuccess={() => setUploadSuccess(true)}
                    isBankTransfer={paymentMethod === 'bank'}
                    isBankSelected={!!selectedBankId}
                />
                
        </div>
    )
}

export default function KonfirmasiPage() {
    const { dictionary } = useLanguage();
    return (
        <LanguageProvider>
            <Suspense fallback={<div className="flex h-screen items-center justify-center">{dictionary.loading}...</div>}>
                <KonfirmasiComponent />
            </Suspense>
        </LanguageProvider>
    )
}

    