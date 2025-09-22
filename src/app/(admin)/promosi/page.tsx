
'use client';

import { useState, ChangeEvent, useMemo, useEffect, useTransition } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Upload, Loader2 } from "lucide-react";
import type { Promotion, Vehicle } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/utils/supabase/client';
import { upsertPromotion, deletePromotion } from '@/app/admin/promosi/actions';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';

function PromotionForm({ promo, vehicles, onSave, onCancel }: { promo?: Promotion | null, vehicles: Vehicle[], onSave: () => void, onCancel: () => void }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const [title, setTitle] = useState(promo?.title || '');
    const [description, setDescription] = useState(promo?.description || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(promo?.imageUrl || null);
    const [vehicleId, setVehicleId] = useState<string | undefined>(promo?.vehicleId || undefined);

     const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result as string);
            reader.readAsDataURL(file);
        }
    };
    
    const handleSave = () => {
        startTransition(async () => {
            if (!title || !previewUrl) {
                toast({ variant: 'destructive', title: 'Judul dan gambar wajib diisi' });
                return;
            }

            const dataToSave: Omit<Promotion, 'created_at'> = {
                id: promo?.id || crypto.randomUUID(),
                title,
                description,
                imageUrl: previewUrl,
                vehicleId: vehicleId || null,
            };

            const result = await upsertPromotion(dataToSave);
            if (result.error) {
                toast({ variant: "destructive", title: "Gagal Menyimpan", description: result.error.message });
            } else {
                toast({ title: promo ? "Promosi Diperbarui" : "Promosi Ditambahkan" });
                onSave();
            }
        });
    };
    
    return (
         <>
             <div className="max-h-[70vh] overflow-y-auto px-1 pr-4">
                <div className="grid gap-6 py-4 px-6">
                    <div className="space-y-2">
                        <Label htmlFor="promo-title">Judul Promosi</Label>
                        <Input id="promo-title" placeholder="cth. Diskon Lebaran" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="promo-description">Deskripsi Singkat</Label>
                        <Textarea id="promo-description" placeholder="Jelaskan promosi Anda..." value={description || ''} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tautkan ke Mobil (Opsional)</Label>
                        <Select onValueChange={setVehicleId} defaultValue={vehicleId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Tidak ditautkan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Tidak ditautkan ke mobil manapun</SelectItem>
                                {vehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                        {vehicle.brand} {vehicle.name} ({vehicle.code})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Gambar Banner Promosi</Label>
                        {previewUrl && (
                            <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                <Image src={previewUrl} alt="Pratinjau" fill className="object-cover" />
                            </div>
                        )}
                        <Label htmlFor="promo-upload" className={cn("w-full cursor-pointer", "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", "border border-input bg-background hover:bg-accent hover:text-accent-foreground", "h-10 px-4 py-2")}>
                            <Upload className="mr-2 h-4 w-4" />
                            {previewUrl ? "Ganti Gambar..." : "Pilih File Gambar..."}
                        </Label>
                        <Input id="promo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                    </div>
                </div>
            </div>
             <DialogFooter className="pt-4 border-t px-6 pb-6 bg-background rounded-b-lg">
                <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button onClick={handleSave} disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {promo ? "Simpan Perubahan" : "Simpan Promosi"}
                </Button>
            </DialogFooter>
        </>
    )
}


export default function PromosiPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
    const [isDeleting, startDeleteTransition] = useTransition();
    const { toast } = useToast();
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    const fetchData = async () => {
        if (!supabase) return;
        setIsLoading(true);
        const { data: promoData, error: promoError } = await supabase.from('promotions').select('*').order('created_at', { ascending: false });
        if (promoError) toast({ variant: 'destructive', title: 'Gagal memuat promosi' });
        else setPromotions(promoData || []);

        const { data: vehicleData, error: vehicleError } = await supabase.from('vehicles').select('*');
        if (vehicleError) toast({ variant: 'destructive', title: 'Gagal memuat kendaraan' });
        else setVehicles(vehicleData || []);
        
        setIsLoading(false);
    }
    
    useEffect(() => {
        const client = createClient();
        setSupabase(client);
    }, []);

    useEffect(() => {
        if (supabase) {
            fetchData();
        }
    }, [supabase]);

    const handleAddClick = () => {
        setSelectedPromo(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (promo: Promotion) => {
        setSelectedPromo(promo);
        setIsFormOpen(true);
    };

    const handleFormSave = () => {
        setIsFormOpen(false);
        setSelectedPromo(null);
        fetchData(); // refetch
    };

    const handleDelete = (promoId: string) => {
        startDeleteTransition(async () => {
            const result = await deletePromotion(promoId);
            if (result.error) {
                 toast({ variant: "destructive", title: "Gagal Menghapus", description: result.error.message });
            } else {
                toast({ variant: "destructive", title: "Promosi Dihapus" });
                fetchData(); // refetch
            }
        });
    };

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Manajemen Promosi</h1>
                <p className="text-muted-foreground">
                Kelola banner promosi yang ditampilkan di halaman utama.
                </p>
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Daftar Promosi Aktif</CardTitle>
                        <CardDescription>Promosi ini akan muncul sebagai slider di halaman utama.</CardDescription>
                    </div>
                    <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Promosi
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-48"><Loader2 className="h-6 w-6 animate-spin"/></div>
                    ) : promotions.length > 0 ? promotions.map(promo => (
                        <div key={promo.id} className="flex items-center gap-4 border rounded-lg p-3">
                            <Image src={promo.imageUrl!} alt={promo.title} width={160} height={90} className="rounded-md object-cover aspect-video bg-muted" data-ai-hint="promotion banner" />
                            <div className="flex-grow">
                                <h4 className="font-bold">{promo.title}</h4>
                                <p className="text-sm text-muted-foreground">{promo.description}</p>
                                {promo.vehicleId && (
                                    <Badge variant="outline" className="mt-2">
                                        Tautan: {vehicles.find(v => v.id === promo.vehicleId)?.brand} {vehicles.find(v => v.id === promo.vehicleId)?.name}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleEditClick(promo)}>
                                    Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" disabled={isDeleting}><Trash2 className="h-4 w-4" /></Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan menghapus promosi "{promo.title}".
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(promo.id)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold">Belum Ada Promosi</h3>
                            <p className="text-sm text-muted-foreground mt-1">Tambahkan promosi pertama Anda.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <DialogContent className="sm:max-w-lg p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{selectedPromo ? "Edit Promosi" : "Tambah Promosi Baru"}</DialogTitle>
                        <DialogDescription>
                            {selectedPromo ? "Perbarui detail promosi di bawah ini." : "Buat promosi baru untuk ditampilkan di halaman utama."}
                        </DialogDescription>
                    </DialogHeader>
                    <PromotionForm 
                        promo={selectedPromo} 
                        vehicles={vehicles}
                        onSave={handleFormSave}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </div>
    )
}

    