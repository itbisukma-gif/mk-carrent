

'use client';

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle } from "@/lib/types";
import { MoreVertical, PlusCircle, Trash2, Upload, Loader2 } from "lucide-react";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useVehicleLogo } from "@/hooks/use-vehicle-logo";
import { useForm, SubmitHandler } from "react-hook-form";
import { upsertVehicle, deleteVehicle } from "./actions";

function VehicleCard({ vehicle, onEdit, onDelete }: { vehicle: Vehicle, onEdit: (vehicle: Vehicle) => void, onDelete: (vehicleId: string) => void }) {
    const { logoUrl } = useVehicleLogo(vehicle.brand || '');

    const hasDiscount = vehicle.discountPercentage && vehicle.discountPercentage > 0;
    const discountedPrice = hasDiscount ? (vehicle.price || 0) * (1 - vehicle.discountPercentage! / 100) : (vehicle.price || 0);
    const isSpecialUnit = vehicle.unitType === 'khusus';

    return (
        <Card className="overflow-hidden flex flex-col group">
            <CardHeader className="p-0 relative">
                 {vehicle.photo ? (
                    <Image
                        src={vehicle.photo}
                        alt={vehicle.name || 'Vehicle image'}
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={vehicle.dataAiHint || 'car exterior'}
                    />
                ) : (
                    <div className="w-full h-48 bg-muted flex items-center justify-center text-muted-foreground">
                        No Image
                    </div>
                )}
                 {logoUrl && (
                    <div className="absolute top-2 left-2 bg-white/70 backdrop-blur-sm p-1.5 rounded-md shadow-sm">
                        <div className="relative h-8 w-12">
                            <Image
                                src={logoUrl}
                                alt={`${vehicle.brand} logo`}
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                )}
                <div className="absolute top-2 right-2 flex items-center gap-2">
                    {hasDiscount && <Badge variant="destructive">{vehicle.discountPercentage}% OFF</Badge>}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => onEdit(vehicle)}>Edit</DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>Hapus</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini tidak dapat diurungkan. Ini akan menghapus data kendaraan <span className="font-bold">{vehicle.brand} {vehicle.name}</span> secara permanen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(vehicle.id)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                 {isSpecialUnit && (
                    <Badge 
                        variant={vehicle.stock && vehicle.stock > 0 ? "default" : "secondary"} 
                        className="absolute bottom-2 left-2"
                    >
                        Stok: {vehicle.stock}
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <div>
                    <h3 className="text-lg font-bold">{vehicle.brand} {vehicle.name}</h3>
                    <p className="text-sm text-muted-foreground">{vehicle.type} - {vehicle.year}</p>
                </div>
                <div className="text-sm mt-4 text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2">
                    <span><span className="font-medium text-foreground">Penumpang:</span> {vehicle.passengers}</span>
                    <span><span className="font-medium text-foreground">Transmisi:</span> {vehicle.transmission}</span>
                    <span><span className="font-medium text-foreground">Bahan Bakar:</span> {vehicle.fuel}</span>
                     <span><span className="font-medium text-foreground">Tipe Unit:</span> <span className="capitalize">{vehicle.unitType || 'biasa'}</span></span>
                </div>
            </CardContent>
            <CardFooter className="p-4 mt-auto bg-muted/50">
                <div className="w-full flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Harga / hari</p>
                    {hasDiscount ? (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground line-through">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(vehicle.price || 0)}</p>
                            <p className="text-lg font-bold text-primary">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(discountedPrice)}</p>
                        </div>
                    ) : (
                        <p className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(vehicle.price || 0)}
                        </p>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

function VehicleForm({ vehicle, onSave, onCancel }: { vehicle?: Vehicle | null; onSave: () => void; onCancel: () => void; }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Vehicle>({
        defaultValues: vehicle || { unitType: 'biasa', stock: 0 }
    });
    
    const [previewUrl, setPreviewUrl] = useState<string | null>(vehicle?.photo || null);
    
    const brand = watch('brand');
    const unitType = watch('unitType');
    const { logoUrl } = useVehicleLogo(brand || '');

    useEffect(() => {
        // This is to handle editing, setting the initial preview URL.
        if (vehicle?.photo) {
            setPreviewUrl(vehicle.photo);
        }
    }, [vehicle]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
                setValue('photo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const onSubmit: SubmitHandler<Vehicle> = (data) => {
        startTransition(async () => {
            // Ensure numeric fields are numbers, not strings from the input
            const vehicleData = {
                ...data,
                price: Number(data.price),
                year: Number(data.year),
                passengers: Number(data.passengers),
                stock: data.unitType === 'khusus' ? Number(data.stock) : null,
            };

            const result = await upsertVehicle(vehicleData);

            if (result.error) {
                toast({
                    variant: "destructive",
                    title: "Gagal Menyimpan",
                    description: result.error.message,
                });
            } else {
                 toast({
                    title: vehicle ? "Kendaraan Diperbarui" : "Kendaraan Ditambahkan",
                    description: `Data untuk ${result.data?.brand} ${result.data?.name} telah disimpan.`,
                });
                onSave();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div className="max-h-[70vh] overflow-y-auto pr-4 px-1">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4 px-6">
                    {/* Image Upload Column */}
                    <div className="lg:col-span-1 space-y-2">
                        <Label>Foto Mobil</Label>
                        <div className="mt-2 flex flex-col items-center gap-4">
                            <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Pratinjau Mobil"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="aspect-video w-full p-8 flex justify-center items-center bg-muted rounded-md border border-dashed">
                                        <p className="text-sm text-center text-muted-foreground">Pratinjau akan muncul di sini</p>
                                    </div>
                                )}
                                {logoUrl && (
                                     <div className="absolute top-2 left-2 bg-white/70 backdrop-blur-sm p-1.5 rounded-md shadow-sm">
                                        <div className="relative h-8 w-12">
                                            <Image
                                                src={logoUrl}
                                                alt={`${brand} logo`}
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Label htmlFor="photo-upload" className={cn("w-full cursor-pointer", "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", "border border-input bg-background hover:bg-accent hover:text-accent-foreground", "h-10 px-4 py-2")}>
                                <Upload className="mr-2 h-4 w-4" />
                                Pilih File Foto...
                            </Label>
                            <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            <input type="hidden" {...register('photo')} />
                        </div>
                    </div>

                    {/* Form Fields Column */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2 grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="unitType">Tipe Unit</Label>
                                <Select value={unitType} onValueChange={(value) => setValue('unitType', value as 'biasa' | 'khusus')}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih Tipe Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="biasa">Unit Biasa (Stok Unlimited)</SelectItem>
                                        <SelectItem value="khusus">Unit Khusus (Stok Terbatas)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {unitType === 'khusus' && (
                                <div className="space-y-2">
                                    <Label htmlFor="stock">Jumlah Stok</Label>
                                    <Input id="stock" type="number" placeholder="cth. 3" {...register('stock')} />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Mobil</Label>
                            <Input id="name" placeholder="cth. Avanza" {...register('name', { required: true })} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand Mobil</Label>
                            <Input 
                                id="brand" 
                                placeholder="cth. Toyota"
                                {...register('brand', { required: true })} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipe Mobil</Label>
                            <Input id="type" placeholder="cth. MPV" {...register('type')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Kode Unit</Label>
                            <Input id="code" placeholder="cth. AVZ-001" {...register('code')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="passengers">Jumlah Penumpang</Label>
                            <Input id="passengers" type="number" placeholder="cth. 7" {...register('passengers')} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transmission">Transmisi</Label>
                            <Select onValueChange={(value) => setValue('transmission', value as 'Manual' | 'Matic')} defaultValue={vehicle?.transmission}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Transmisi" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Manual">Manual</SelectItem>
                                    <SelectItem value="Matic">Matic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fuel">Jenis Bahan Bakar</Label>
                            <Select onValueChange={(value) => setValue('fuel', value)} defaultValue={vehicle?.fuel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Jenis Bahan Bakar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bensin">Bensin</SelectItem>
                                    <SelectItem value="Diesel">Diesel</SelectItem>
                                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                                    <SelectItem value="Listrik">Listrik</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="year">Tahun</Label>
                            <Input id="year" type="number" placeholder="cth. 2022" {...register('year')} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="price">Harga Sewa / Hari</Label>
                            <Input id="price" type="number" placeholder="cth. 350000" {...register('price', { required: true })} />
                        </div>
                    </div>
                </div>
            </div>
             <DialogFooter className="pt-4 border-t px-6 pb-6 bg-background rounded-b-lg">
                <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {isPending ? "Menyimpan..." : vehicle ? "Simpan Perubahan" : "Simpan Kendaraan"}
                </Button>
            </DialogFooter>
        </form>
    )
}

export default function ArmadaPage() {
  const [fleet, setFleet] = useState<Vehicle[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();
  
  const fetchFleet = async () => {
    setIsLoading(true);
    // In a real app, you'd fetch from an API route that uses Supabase.
    // For simplicity here, we call Supabase client directly.
    const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        toast({ variant: 'destructive', title: 'Gagal mengambil data', description: error.message });
    } else {
        setFleet(data || []);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchFleet();
  }, []);

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  }
  
  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };
  
  const handleDelete = async (vehicleId: string) => {
    const result = await deleteVehicle(vehicleId);
    if (result.error) {
        toast({ variant: 'destructive', title: 'Gagal menghapus', description: result.error.message });
    } else {
        toast({
            title: "Berhasil Dihapus",
            description: `Kendaraan telah dihapus.`,
        });
        fetchFleet(); // Refetch data
    }
  };

  const handleFormSave = () => {
    setFormOpen(false);
    setSelectedVehicle(null);
    fetchFleet(); // Refetch data after saving
  }
  
  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedVehicle(null);
  }

  const dialogTitle = selectedVehicle ? "Edit Kendaraan" : "Tambahkan Armada Baru";
  const dialogDescription = selectedVehicle ? "Perbarui detail kendaraan di bawah ini." : "Isi detail kendaraan baru di bawah ini.";

  if (isLoading) {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                <h1 className="text-3xl font-bold tracking-tight">Armada Kendaraan</h1>
                <p className="text-muted-foreground">
                    Kelola semua unit kendaraan yang tersedia.
                </p>
                </div>
                <Button onClick={handleAddClick} disabled>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambahkan Armada
                </Button>
            </div>
            <div className="text-center py-16 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Memuat data armada...</span>
            </div>
        </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Armada Kendaraan</h1>
          <p className="text-muted-foreground">
            Kelola semua unit kendaraan yang tersedia.
          </p>
        </div>
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambahkan Armada
        </Button>
      </div>

      {fleet.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {fleet.map((vehicle) => (
                <VehicleCard 
                    key={vehicle.id} 
                    vehicle={vehicle} 
                    onEdit={handleEditClick}
                    onDelete={handleDelete}
                />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Belum Ada Armada</h3>
            <p className="text-muted-foreground mt-2 mb-6">Tambahkan kendaraan pertama Anda untuk memulai.</p>
            <Button onClick={handleAddClick}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Tambahkan Armada
            </Button>
        </div>
      )}
       <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
         <DialogContent className="sm:max-w-4xl p-0">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            <VehicleForm 
                vehicle={selectedVehicle} 
                onSave={handleFormSave}
                onCancel={handleFormCancel}
            />
        </DialogContent>
       </Dialog>
    </div>
  );
}
