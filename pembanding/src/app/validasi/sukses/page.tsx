
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ValidasiSuksesPage() {
    return (
        <Card className="w-full max-w-md text-center shadow-lg">
            <CardHeader>
                <div className='flex justify-center mb-4'>
                     <CheckCircle2 className="h-20 w-20 text-green-500" />
                </div>
                <CardTitle className="text-3xl font-bold">Pembayaran Tervalidasi!</CardTitle>
                <CardDescription className="text-base text-muted-foreground pt-2">
                    Pembayaran untuk pesanan <span className='font-mono font-medium text-foreground'>ORD002</span> telah berhasil kami konfirmasi.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className='text-sm'>
                    Tim kami telah mengirimkan detail konfirmasi dan informasi penjemputan kendaraan ke nomor WhatsApp pelanggan. Terima kasih.
                </p>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/dashboard/orders">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke List Order
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

