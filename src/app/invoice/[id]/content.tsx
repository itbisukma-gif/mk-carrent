
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order, ContactInfo } from '@/lib/types';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Share2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';

interface InvoicePageContentProps {
    orderId: string;
    isShared?: boolean;
}

export function InvoicePageContent({ orderId, isShared = false }: InvoicePageContentProps) {
    const { toast } = useToast();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const [order, setOrder] = useState<Order | null>(null);
    const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const client = createClient();
        setSupabase(client);
    }, []);

    useEffect(() => {
        if (!supabase) return;

        const fetchData = async () => {
            setIsLoading(true);
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();
            
            const { data: contactData, error: contactError } = await supabase
                .from('contact_info')
                .select('*')
                .single();

            if (orderError) toast({ variant: 'destructive', title: 'Gagal memuat pesanan' });
            else setOrder(orderData);

            if (contactError) toast({ variant: 'destructive', title: 'Gagal memuat info kontak' });
            else setContactInfo(contactData);
            
            setIsLoading(false);
        };
        fetchData();
    }, [supabase, orderId, toast]);
    
    const handleDownload = async () => {
        const element = document.getElementById('invoice-card');
        if (!element) return;
        const html2pdf = (await import('html2pdf.js')).default;
        html2pdf().from(element).set({
            margin: 1,
            filename: `invoice-${orderId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        }).save();
    };

    const handleShare = () => {
        const url = `${window.location.origin}/invoice/${orderId}/share`;
        navigator.clipboard.writeText(url);
        toast({
            title: "Tautan Disalin!",
            description: "Tautan invoice berhasil disalin ke clipboard.",
        });
    };
    
    const handlePrint = () => {
        window.print();
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted/40">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }

    if (!order || !contactInfo) {
        return (
            <div className="flex items-center justify-center h-screen bg-muted/40">
                <p>Data tidak ditemukan.</p>
            </div>
        );
    }
    
    const formatCurrency = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);

    const items = [
        { description: `Sewa ${order.carName}`, quantity: 1, price: order.total || 0 }
    ];

    const subtotal = items.reduce((acc, item) => acc + item.price, 0);
    const tax = 0; // Assuming no tax for now
    const total = subtotal + tax;

    return (
         <Card id="invoice-card" className="w-full max-w-2xl shadow-lg printable-card">
            <CardHeader className="space-y-0 p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                             <Logo className="w-8 h-8 text-primary"/>
                            <h2 className="text-2xl font-bold">MudaKarya CarRent</h2>
                        </div>
                        <p className="text-sm text-muted-foreground">{contactInfo.address}</p>
                        <p className="text-sm text-muted-foreground">{contactInfo.email} / {contactInfo.whatsapp}</p>
                    </div>
                     <div className="text-right">
                        <h1 className="text-3xl font-bold tracking-tight">INVOICE</h1>
                        <p className="text-sm text-muted-foreground mt-1"># {order.id}</p>
                    </div>
                </div>
                <div className="flex justify-between items-end pt-8">
                     <div>
                        <h3 className="font-semibold">Ditagihkan Kepada:</h3>
                        <p className="text-sm">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm"><span className="font-semibold">Tanggal Invoice:</span> {format(new Date(order.created_at), "d LLLL yyyy", { locale: id })}</p>
                        <Badge className="mt-2 text-base" variant={order.status === 'disetujui' ? 'default' : 'destructive'}>
                            {order.status === 'disetujui' ? 'LUNAS' : 'BELUM LUNAS'}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b">
                            <tr className="text-left font-medium">
                                <th className="py-2 pr-4">Deskripsi</th>
                                <th className="py-2 px-4 text-center">Jumlah</th>
                                <th className="py-2 px-4 text-right">Harga</th>
                                <th className="py-2 pl-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index} className="border-b">
                                    <td className="py-2 pr-4">{item.description}</td>
                                    <td className="py-2 px-4 text-center">{item.quantity}</td>
                                    <td className="py-2 px-4 text-right">{formatCurrency(item.price)}</td>
                                    <td className="py-2 pl-4 text-right">{formatCurrency(item.quantity * item.price)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-end mt-4">
                    <div className="w-full max-w-xs space-y-2 text-sm">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>{formatCurrency(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Pajak</span>
                            <span>{formatCurrency(tax)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base">
                            <span>TOTAL</span>
                            <span className="text-primary">{formatCurrency(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 border-t pt-4 text-xs text-muted-foreground">
                    <h4 className="font-semibold text-sm text-foreground mb-2">Catatan:</h4>
                    <p>- Pembayaran dianggap sah jika sudah dikonfirmasi oleh tim kami.</p>
                    <p>- Terima kasih telah menggunakan layanan MudaKarya CarRent.</p>
                </div>
            </CardContent>
            {!isShared && (
                <CardFooter className="flex justify-end gap-2 p-6 no-print">
                    <Button variant="outline" onClick={handleShare}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Bagikan
                    </Button>
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Cetak
                    </Button>
                    <Button onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
