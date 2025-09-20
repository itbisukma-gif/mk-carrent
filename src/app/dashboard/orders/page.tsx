

'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Send, Eye, Share, CheckCircle, User, Car, ShieldCheck, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import type { Driver, Order, OrderStatus } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { drivers as initialDrivers, orders as initialOrders } from '@/lib/data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { id } from 'date-fns/locale';


const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
        case 'disetujui':
            return { label: 'Disetujui', className: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-100' };
        case 'pending':
            return { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100' };
        case 'tidak disetujui':
            return { label: 'Ditolak', className: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-100' };
        case 'selesai':
            return { label: 'Selesai', className: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100' };
        default:
            return { label: 'Unknown', className: 'bg-secondary text-secondary-foreground hover:bg-secondary' };
    }
}

function OrderCard({ order, drivers, onStatusChange, onDriverChange, onComplete }: { order: Order, drivers: Driver[], onStatusChange: (orderId: string, status: OrderStatus) => void, onDriverChange: (orderId: string, driverName: string) => void, onComplete: (orderId: string) => void }) {
    const [isClient, setIsClient] = useState(false);
    
    useEffect(() => {
        setIsClient(true);
    }, []);

    const statusInfo = getStatusInfo(order.status);
    const requiresDriver = order.service.toLowerCase().includes("supir") || order.service.toLowerCase().includes("all");

    // Ensure createdAt is a valid date object before using it
    const orderDate = order.createdAt ? new Date(order.createdAt) : new Date();
    const timeSinceCreation = isClient ? formatDistanceToNow(orderDate, { addSuffix: true, locale: id }) : '...';
    const hoursSinceCreation = differenceInHours(new Date(), orderDate);
    const needsAttention = order.status === 'pending' && hoursSinceCreation > 1;

    return (
         <Card className="flex flex-col">
            <CardHeader className='pb-4'>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{order.customerName}</CardTitle>
                        <CardDescription className="font-mono text-xs">{order.id}</CardDescription>
                         <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1.5">
                            <Clock className="h-3 w-3" />
                            <span>dibuat {timeSinceCreation}</span>
                        </div>
                    </div>
                     <Badge variant="outline" className={cn("capitalize text-xs", statusInfo.className)}>{statusInfo.label}</Badge>
                </div>
                <div className="flex items-center gap-2 pt-3 text-sm text-muted-foreground">
                    <Car className="h-4 w-4" />
                    <span>{order.carName}</span>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                 {needsAttention && (
                    <Alert variant="destructive" className="bg-yellow-50 border-yellow-200 text-yellow-800 [&>svg]:text-yellow-600">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="font-semibold">Perlu Perhatian</AlertTitle>
                        <AlertDescription className="text-yellow-700">
                            Pesanan ini belum ditanggapi lebih dari 1 jam.
                        </AlertDescription>
                    </Alert>
                )}
                <Separator />
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Layanan</span>
                        <span className="font-medium">{order.service}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Driver</span>
                         {requiresDriver ? (
                            <Select 
                                value={order.driver || undefined} 
                                onValueChange={(driverName) => onDriverChange(order.id, driverName)}
                                disabled={order.status === 'disetujui' || order.status === 'selesai'}
                            >
                                <SelectTrigger className="w-[180px] h-8 text-xs">
                                <SelectValue placeholder="Pilih Driver" />
                                </SelectTrigger>
                                <SelectContent>
                                    {drivers.map(d => 
                                        <SelectItem 
                                            key={d.id} 
                                            value={d.name}
                                            disabled={d.status === 'Bertugas' && order.driver !== d.name}
                                            className="text-xs"
                                        >
                                            {d.name} ({d.status})
                                        </SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        ) : (
                            <span className="font-medium">-</span>
                        )}
                    </div>
                </div>
                 <Separator />
            </CardContent>
            <CardFooter className="flex-col sm:flex-row gap-2 justify-between items-center">
                <Dialog>
                    <DialogTrigger asChild>
                         <Button variant="ghost" size="sm" className="w-full sm:w-auto justify-start text-muted-foreground hover:text-primary">
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

                <div className="flex items-center gap-2">
                    {order.status === 'disetujui' && (
                         <>
                            <Button size="sm" variant="outline" asChild>
                            <Link href={`/invoice/${order.id}/share`} target="_blank">
                                <Share className="h-3 w-3" />
                            </Link>
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="default" className='bg-blue-600 hover:bg-blue-700'>
                                        <Send className="h-3 w-3 mr-2" />
                                        Selesaikan
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Selesaikan Pesanan Ini?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini akan mengubah status pesanan menjadi "Selesai" dan mengembalikan status driver (jika ada) menjadi "Tersedia".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onComplete(order.id)}>Ya, Selesaikan</AlertDialogAction>
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
                     {order.status === 'tidak disetujui' && (
                        <div className='flex items-center text-sm text-red-600 font-medium'>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Pesanan Ditolak
                        </div>
                    )}
                    {order.status !== 'selesai' && order.status !== 'tidak disetujui' && (
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant={order.status === 'disetujui' ? "secondary" : "default"} size="sm">
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                    {order.status === 'pending' ? 'Verifikasi' : 'Ubah Status'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                 <DropdownMenuLabel>Ubah Status Pesanan</DropdownMenuLabel>
                                 <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={order.status} onValueChange={(value) => onStatusChange(order.id, value as OrderStatus)}>
                                    <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="disetujui">Disetujui</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="tidak disetujui">Ditolak</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}


export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>(initialOrders);
    const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
    const { toast } = useToast();

    const { pendingOrders, approvedOrders, completedOrders } = useMemo(() => {
        return {
            pendingOrders: orders.filter(o => o.status === 'pending'),
            approvedOrders: orders.filter(o => o.status === 'disetujui'),
            completedOrders: orders.filter(o => o.status === 'selesai' || o.status === 'tidak disetujui'),
        }
    }, [orders]);

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        toast({
            title: "Status Diperbarui",
            description: `Status untuk pesanan ${orderId} telah diubah.`
        });
    };
    
    const handleDriverChange = (orderId: string, driverName: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // Free up the old driver if there was one
        if (order.driver) {
             setDrivers(prevDrivers => 
                prevDrivers.map(d => d.name === order.driver ? { ...d, status: 'Tersedia' } : d)
            );
        }
        
        // Update the order with the new driver
        setOrders(prevOrders => prevOrders.map(o => o.id === orderId ? { ...o, driver: driverName } : o));
        
        // Set the new driver's status to 'Bertugas'
        setDrivers(prevDrivers => 
            prevDrivers.map(d => d.name === driverName ? { ...d, status: 'Bertugas' } : d)
        );

        toast({
            title: "Driver Ditugaskan",
            description: `${driverName} telah ditugaskan ke pesanan ${orderId}.`
        });
    };

    const handleSelesaikanPesanan = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;

        // If a driver was assigned, set their status back to 'Tersedia'
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
      
       <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="incoming">
                Pesanan Masuk
                 {pendingOrders.length > 0 && (
                    <Badge className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center">{pendingOrders.length}</Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="on-progress">
                On Progress
                {approvedOrders.length > 0 && (
                     <Badge className="ml-2 rounded-full h-5 w-5 p-0 flex items-center justify-center">{approvedOrders.length}</Badge>
                )}
            </TabsTrigger>
            <TabsTrigger value="completed">
                Selesai
            </TabsTrigger>
        </TabsList>
        <TabsContent value="incoming" className="mt-6">
           {pendingOrders.length > 0 ? (
            <div className="flex flex-col gap-6">
                {pendingOrders.map((order) => (
                   <OrderCard 
                    key={order.id} 
                    order={order}
                    drivers={drivers}
                    onStatusChange={handleStatusChange}
                    onDriverChange={handleDriverChange}
                    onComplete={handleSelesaikanPesanan}
                   />
                ))}
            </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Tidak Ada Pesanan Masuk</h3>
                    <p className="text-muted-foreground mt-2 mb-6">Saat ada pesanan baru dengan status "pending", pesanan tersebut akan muncul di sini.</p>
                </div>
            )}
        </TabsContent>
         <TabsContent value="on-progress" className="mt-6">
           {approvedOrders.length > 0 ? (
            <div className="flex flex-col gap-6">
                {approvedOrders.map((order) => (
                   <OrderCard 
                    key={order.id} 
                    order={order}
                    drivers={drivers}
                    onStatusChange={handleStatusChange}
                    onDriverChange={handleDriverChange}
                    onComplete={handleSelesaikanPesanan}
                   />
                ))}
            </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Tidak Ada Pesanan Aktif</h3>
                    <p className="text-muted-foreground mt-2 mb-6">Pesanan yang telah Anda setujui akan ditampilkan di sini.</p>
                </div>
            )}
        </TabsContent>
         <TabsContent value="completed" className="mt-6">
           {completedOrders.length > 0 ? (
            <div className="flex flex-col gap-6">
                {completedOrders.map((order) => (
                   <OrderCard 
                    key={order.id} 
                    order={order}
                    drivers={drivers}
                    onStatusChange={handleStatusChange}
                    onDriverChange={handleDriverChange}
                    onComplete={handleSelesaikanPesanan}
                   />
                ))}
            </div>
            ) : (
                <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">Belum Ada Pesanan Selesai</h3>
                    <p className="text-muted-foreground mt-2 mb-6">Pesanan yang telah selesai atau ditolak akan muncul di sini.</p>
                </div>
            )}
        </TabsContent>
       </Tabs>
    </div>
  );
}

    

    