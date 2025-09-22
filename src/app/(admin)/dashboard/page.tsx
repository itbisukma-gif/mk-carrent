
'use client';

import { useState, ChangeEvent, useMemo, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Driver } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { upsertDriver, deleteDriver, updateDriverStatus } from '@/app/admin/dashboard/actions';
import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"

export const dynamic = 'force-dynamic';

function DriverForm({ driver, onSave, onCancel }: { driver?: Driver | null, onSave: () => void, onCancel: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [name, setName] = useState(driver?.name || '');
    const [phone, setPhone] = useState(driver?.phone || '');
    const [address, setAddress] = useState(driver?.address || '');

    const handleSave = () => {
        startTransition(async () => {
             if (!name) {
                toast({ variant: 'destructive', title: 'Nama wajib diisi' });
                return;
            }

            const driverData = {
                id: driver?.id || crypto.randomUUID(),
                name,
                phone,
                address,
                status: driver?.status || 'Tersedia'
            };

            const result = await upsertDriver(driverData);
            if (result.error) {
                 toast({ variant: "destructive", title: "Gagal Menyimpan", description: result.error.message });
            } else {
                toast({ title: driver ? "Driver Diperbarui" : "Driver Ditambahkan" });
                onSave();
            }
        });
    };
    
    return (
        <>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Nama Driver</Label>
                    <Input id="name" placeholder="cth. Pak Agus" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">No. Telepon</Label>
                    <Input id="phone" placeholder="cth. 08123..." value={phone || ''} onChange={e => setPhone(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input id="address" placeholder="cth. Jl. Merdeka No. 10" value={address || ''} onChange={e => setAddress(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                 <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {driver ? "Simpan Perubahan" : "Simpan Driver"}
                </Button>
            </DialogFooter>
        </>
    )
}

export default function DashboardPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setFormOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const { toast } = useToast();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    const fetchDrivers = async () => {
        if (!supabase) return;
        setIsLoading(true);
        const { data, error } = await supabase.from('drivers').select('*');
        if (error) {
            toast({ variant: 'destructive', title: 'Gagal mengambil data driver' });
        } else {
            setDrivers(data || []);
        }
        setIsLoading(false);
    }
    
    useEffect(() => {
        const supabaseClient = createClient();
        setSupabase(supabaseClient);
    }, []);

    useEffect(() => {
        if (supabase) {
            fetchDrivers();
        }
    }, [supabase]);

    const handleAddClick = () => {
        setSelectedDriver(null);
        setFormOpen(true);
    }

    const handleEditClick = (driver: Driver) => {
        setSelectedDriver(driver);
        setFormOpen(true);
    }

    const handleFormSave = () => {
        setFormOpen(false);
        setSelectedDriver(null);
        fetchDrivers();
    }

    const handleDelete = async (driverId: string) => {
        const result = await deleteDriver(driverId);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Gagal menghapus driver' });
        } else {
            toast({ title: 'Driver Dihapus' });
            fetchDrivers();
        }
    }

    const handleStatusChange = async (driverId: string, currentStatus: 'Tersedia' | 'Bertugas') => {
        const newStatus = currentStatus === 'Tersedia' ? 'Bertugas' : 'Tersedia';
        const result = await updateDriverStatus(driverId, newStatus);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Gagal update status' });
        } else {
            toast({ title: 'Status Driver Diperbarui' });
            fetchDrivers();
        }
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Ringkasan dan manajemen driver.
                </p>
                </div>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manajemen Driver</CardTitle>
                        <CardDescription>Kelola ketersediaan driver Anda.</CardDescription>
                    </div>
                     <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Driver
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="text-center py-16 flex items-center justify-center gap-2 text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Memuat data driver...</span>
                        </div>
                    ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>No. Telepon</TableHead>
                            <TableHead>Alamat</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                        {drivers.length > 0 ? drivers.map(driver => (
                            <TableRow key={driver.id}>
                                <TableCell className="font-medium">{driver.name}</TableCell>
                                <TableCell>{driver.phone}</TableCell>
                                <TableCell>{driver.address}</TableCell>
                                <TableCell>
                                    <Button 
                                        variant={driver.status === 'Tersedia' ? 'outline' : 'secondary'}
                                        size="sm"
                                        onClick={() => handleStatusChange(driver.id, driver.status)}
                                    >
                                        {driver.status}
                                    </Button>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4"/></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                            <DropdownMenuItem onSelect={() => handleEditClick(driver)}>Edit</DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">Hapus</DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                                        <AlertDialogDescription>Tindakan ini akan menghapus driver {driver.name} secara permanen.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDelete(driver.id)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Belum ada driver ditambahkan.</TableCell>
                            </TableRow>
                        )}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

             <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>{selectedDriver ? 'Edit Driver' : 'Tambah Driver Baru'}</DialogTitle>
                    </DialogHeader>
                    <DriverForm 
                        driver={selectedDriver}
                        onSave={handleFormSave}
                        onCancel={() => setFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}
