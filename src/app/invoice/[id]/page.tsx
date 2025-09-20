'use client'

import { useParams, notFound, useRouter } from 'next/navigation';
import { orders, calculateInvoiceDetails } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Loader2, UserCheck, Share2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

// Helper to get status color
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
        case 'Lunas':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'tidak disetujui':
            return 'destructive';
        default:
            return 'secondary';
    }
}


export default function InvoicePage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const [isDownloading, setIsDownloading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check for session cookie on client-side to determine if user is an admin
        if (typeof window !== 'undefined') {
            const sessionCookie = document.cookie.split('; ').find(row => row.startsWith('session='));
            if (sessionCookie) {
                setIsAdmin(true);
            }
        }
    }, []);

    const orderId = params.id as string;
    const order = orders.find(o => o.id === orderId);

    if (!order) {
        notFound();
    }
    
    // Rule: Invoice is only available for approved orders
    if (order.status !== 'disetujui') {
        return (
             <Card className="w-full max-w-md shadow-lg text-center">
                <CardHeader>
                    <div className="flex justify-center items-center gap-2.5 mb-4">
                        <AlertTriangle className="w-12 h-12 text-destructive" />
                    </div>
                    <CardTitle className="text-xl">Invoice Belum Tersedia</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Invoice hanya dapat dibuat untuk pesanan yang telah lunas dan disetujui. Status pesanan ini adalah <span className='font-semibold capitalize'>{order.status}</span>.</p>
                </CardContent>
                <CardFooter className='flex flex-col gap-4'>
                    <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard/keuangan')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Halaman Keuangan
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    const { total, rentalCost, mFee, dFee, fuelFee, discAmount, days } = calculateInvoiceDetails(order);
    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(value);
    
    const displayStatus = order.status === 'disetujui' ? 'Lunas' : order.status;


    const handleDownload = async () => {
        setIsDownloading(true);
        const element = document.getElementById('invoice-card-for-pdf');
        if (!element) {
            toast({
                variant: 'destructive',
                title: 'Terjadi Kesalahan',
                description: 'Elemen invoice tidak ditemukan. Silakan coba lagi.',
            });
            setIsDownloading(false);
            return;
        }

        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const opt = {
              margin:       0.5,
              filename:     `invoice-${order.id}.pdf`,
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
            };
            await html2pdf().set(opt).from(element).save();
            toast({
                title: 'Invoice Diunduh!',
                description: 'File PDF berhasil dibuat dan diunduh.',
            });
        } catch (err) {
            toast({
                variant: 'destructive',
                title: 'Gagal Mengunduh',
                description: 'Terjadi kesalahan saat membuat file PDF.',
            });
            console.error(err);
        } finally {
            setIsDownloading(false);
        }
    };


    return (
        <Card id="invoice-card-for-pdf" className="w-full max-w-md shadow-lg">
            <CardHeader className="text-center">
                <div className="flex justify-center items-center gap-2.5 mb-4">
                    <Logo className="w-8 h-8 text-primary" />
                    <span className="text-2xl font-bold tracking-tight">MudaKarya CarRent</span>
                </div>
                <CardTitle className="text-2xl">Rincian Pembayaran</CardTitle>
                <CardDescription>Order ID: <span className='font-mono'>{order.id}</span></CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 space-y-2.5 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Status Pembayaran</span>
                        <Badge variant={getStatusVariant(displayStatus)} className="capitalize">{displayStatus}</Badge>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Pelanggan</span>
                        <span className='font-medium'>{order.customerName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Metode Pembayaran</span>
                        <span className='font-medium'>{order.paymentMethod}</span>
                    </div>
                     <Separator />
                     <h4 className='font-semibold pt-2'>Detail Sewa</h4>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Kendaraan</span>
                        <span className='font-medium'>{order.carName}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Periode</span>
                        <span className='font-medium'>14 Agt 24 - 15 Agt 24</span> {/* Simulated date */}
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Layanan</span>
                        <span className='font-medium'>{order.service}</span>
                    </div>
                    <Separator />
                    <h4 className='font-semibold pt-2'>Rincian Biaya</h4>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Sewa Mobil ({days} hari)</span>
                        <span className='font-medium'>{formatCurrency(rentalCost)}</span>
                    </div>
                    {dFee > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya Supir</span>
                            <span className='font-medium'>{formatCurrency(dFee)}</span>
                        </div>
                    )}
                    {fuelFee > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya BBM</span>
                            <span className='font-medium'>{formatCurrency(fuelFee)}</span>
                        </div>
                    )}
                    {mFee > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Biaya Matic</span>
                            <span className='font-medium'>{formatCurrency(mFee)}</span>
                        </div>
                    )}
                     {discAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span className="font-medium">Diskon</span>
                            <span>- {formatCurrency(discAmount)}</span>
                        </div>
                    )}
                    <Separator className='my-2' />
                     <div className="flex justify-between items-baseline pt-1">
                        <span className="text-base font-bold">Total Tagihan</span>
                        <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                    </div>
                </div>

                {isAdmin && order.status === 'disetujui' && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground p-2 bg-blue-50 border border-blue-200 rounded-md">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <span>Divalidasi oleh: <strong>Admin 1</strong></span>
                    </div>
                )}

            </CardContent>
            <CardFooter className='flex flex-col gap-4'>
                 <Button className="w-full" onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4 mr-2" />
                    )}
                    {isDownloading ? 'Mengunduh...' : 'Download PDF'}
                </Button>
                <Button asChild className="w-full" variant="outline">
                    <Link href={`/invoice/${order.id}/share`} target="_blank">
                        <Share2 className="h-4 w-4 mr-2" />
                        Bagikan ke Pelanggan
                    </Link>
                </Button>
                <Button variant="link" size="sm" className='text-muted-foreground' onClick={() => router.push('/dashboard/keuangan')}>
                    <ArrowLeft className="h-3 w-3 mr-1.5" />
                    Kembali ke Halaman Keuangan
                </Button>
            </CardFooter>
        </Card>
    );
}
