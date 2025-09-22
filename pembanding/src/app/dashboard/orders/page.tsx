

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Send, Eye, Share, CheckCircle } from "lucide-react";
import Link from "next/link";
import type { Driver, Order, OrderStatus } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

export default function OrdersPage() {
    // Data is now managed by state, ready for API integration
    const [orders, setOrders] = useState<Order[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const { toast } = useToast();

    // Fetch initial data from API - this is a placeholder for actual data fetching
    useEffect(() => {
      // Example: fetch('/api/orders').then(res => res.json()).then(data => setOrders(data));
      // Example: fetch('/api/drivers').then(res => res.json()).then(data => setDrivers(data));
    }, []);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        // API call to update order status
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast({
            title: "Status Diperbarui",
            description: `Status untuk pesanan ${orderId} telah diubah menjadi ${newStatus}.`
        });
    };
    
    const handleDriverChange = (orderId: string, driverName: string) => {
        // API call to update driver assignment
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, driver: driverName } : o));
        toast({
            title: "Driver Ditugaskan",
            description: `${driverName} telah ditugaskan ke pesanan ${orderId}.`
        });
    };

    const handleSelesaikanPesanan = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // API call to update driver status and order status
        if (order.driver) {
            setDrivers(prevDrivers => 
                prevDrivers.map(d => d.name === order.driver ? { ...d, status: 'Tersedia' } : d)
            );
        }
        handleStatusChange(orderId, 'selesai');
        
        toast({
            title: "Pesanan Selesai",
            description: `Pesanan dengan ID ${orderId} telah ditandai sebagai selesai.`,
        });
    };

    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
            case 'disetujui':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'tidak disetujui':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'selesai':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    }
    
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">List Order</h1>
          <p className="text-muted-foreground">
            Kelola order masuk dan status persetujuannya.
          </p>
        </div>
      </div>

      <div className="border rounded-lg w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan & Mobil</TableHead>
                <TableHead>Layanan</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Verifikasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                    <TableRow key={order.id}>
                    <TableCell>
                        {/* Customer name would come from the order data */}
                        <div className="font-medium">Siti Aminah</div> 
                        <div className="text-sm text-muted-foreground">{order.carName}</div>
                    </TableCell>
                    <TableCell>
                        <span className="text-sm">{order.service}</span>
                    </TableCell>
                    <TableCell>
                        {order.service === "Dengan Supir" ? (
                        <Select 
                            defaultValue={order.driver || undefined} 
                            onValueChange={(driverName) => handleDriverChange(order.id, driverName)}
                            disabled={order.status === 'disetujui' || order.status === 'selesai'}
                        >
                            <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Pilih Driver" />
                            </SelectTrigger>
                            <SelectContent>
                                {drivers.map(d => <SelectItem key={d.id} value={d.name}>{d.name} ({d.status})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        ) : (
                        "-"
                        )}
                    </TableCell>
                    <TableCell>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    Bukti Bayar
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                                <DialogHeader>
                                    <DialogTitle>Bukti Pembayaran</DialogTitle>
                                    <DialogDescription>
                                        Order ID: {order.id}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="relative mt-4 aspect-video w-full">
                                <Image 
                                    src={order.paymentProof} 
                                    alt="Bukti Pembayaran" 
                                    fill
                                    className="rounded-md object-contain" 
                                />
                                </div>
                            </DialogContent>
                        </Dialog>
                    </TableCell>
                    <TableCell>
                        <Select value={order.status} onValueChange={(value: OrderStatus) => handleStatusChange(order.id, value)} disabled={order.status === 'selesai'}>
                        <SelectTrigger className={cn("w-[150px] capitalize", getStatusClass(order.status))}>
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="disetujui">Disetujui</SelectItem>
                            <SelectItem value="tidak disetujui">Tidak Disetujui</SelectItem>
                            {order.status === 'selesai' && <SelectItem value="selesai">Selesai</SelectItem>}
                        </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                            {order.status === 'disetujui' && (
                            <>
                                <Button size="sm" variant="outline" asChild>
                                <Link href={`/invoice/${order.id}/share`} target="_blank">
                                    <Share className="h-4 w-4 mr-2" />
                                    Bagikan Invoice
                                </Link>
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button size="sm">
                                            <Send className="h-4 w-4 mr-2" />
                                            Selesaikan Pesanan
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Selesaikan Pesanan Ini?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan mengubah status pesanan menjadi &quot;Selesai&quot; dan mengembalikan status driver (jika ada) menjadi &quot;Tersedia&quot;.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleSelesaikanPesanan(order.id)}>Ya, Selesaikan</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                            )}
                            {order.status === 'selesai' && (
                                <div className='flex items-center text-sm text-blue-600 font-medium'>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Pesanan Selesai
                                </div>
                            )}
                        </div>
                    </TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        Belum ada order yang masuk.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
    </div>
  );
}
