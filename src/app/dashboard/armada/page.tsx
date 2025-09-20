

'use client';

import { useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle } from "@/lib/types";
import { fleet as initialFleet } from "@/lib/data"; // Import dummy data
import { MoreVertical, PlusCircle, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useVehicleLogo } from "@/hooks/use-vehicle-logo";

function VehicleCard({ vehicle, onEdit, onDelete }: { vehicle: Vehicle, onEdit: (vehicle: Vehicle) => void, onDelete: (vehicle: Vehicle) => void }) {
    const { toast } = useToast();
    const { logoUrl } = useVehicleLogo(vehicle.brand);

    const hasDiscount = vehicle.discountPercentage && vehicle.discountPercentage > 0;
    const discountedPrice = hasDiscount ? vehicle.price * (1 - vehicle.discountPercentage! / 100) : vehicle.price;
    const isSpecialUnit = vehicle.unitType === 'khusus';

    return (
        <Card className="overflow-hidden flex flex-col group">
            <CardHeader className="p-0 relative">
                <Image
                    src={vehicle.photo}
                    alt={vehicle.name}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={vehicle.dataAiHint}
                />
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
                                        <AlertDialogAction onClick={() => onDelete(vehicle)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
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
                            <p className="text-sm text-muted-foreground line-through">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(vehicle.price)}</p>
                            <p className="text-lg font-bold text-primary">{new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(discountedPrice)}</p>
                        </div>
                    ) : (
                        <p className="text-lg font-bold text-primary">
                            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(vehicle.price)}
                        </p>
                    )}
                </div>
            </CardFooter>
        </Card>
    );
}

function VehicleForm({ vehicle, onSave, onCancel }: { vehicle?: Vehicle | null; onSave: () => void; onCancel: () => void; }) {
    const { toast } = useToast();
    const [previewUrl, setPreviewUrl] = useState<string | null>(vehicle?.photo || null);
    const [brand, setBrand] = useState(vehicle?.brand || '');
    const { logoUrl } = useVehicleLogo(brand);
    const [unitType, setUnitType] = useState<'biasa' | 'khusus'>(vehicle?.unitType || 'biasa');


    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
        }
    };
    
    const handleSave = () => {
        // Here you would typically handle form submission, e.g., using react-hook-form
        // and calling an API to save the vehicle data.
        // For this simulation, we'll just show a toast.
        toast({
            title: vehicle ? "Kendaraan Diperbarui" : "Kendaraan Ditambahkan",
            description: `Data kendaraan telah berhasil ${vehicle ? 'diperbarui' : 'disimpan'}.`,
        });
        onSave(); // This will trigger the parent component to close the dialog
    };


    return (
        <>
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
                        </div>
                    </div>

                    {/* Form Fields Column */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="md:col-span-2 grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <Label htmlFor="unitType">Tipe Unit</Label>
                                <Select value={unitType} onValueChange={(value) => setUnitType(value as 'biasa' | 'khusus')}>
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
                                    <Input id="stock" type="number" placeholder="cth. 3" defaultValue={vehicle?.stock} />
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Nama Mobil</Label>
                            <Input id="name" placeholder="cth. Avanza" defaultValue={vehicle?.name} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="brand">Brand Mobil</Label>
                            <Input 
                                id="brand" 
                                placeholder="cth. Toyota" 
                                value={brand} 
                                onChange={(e) => setBrand(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="type">Tipe Mobil</Label>
                            <Input id="type" placeholder="cth. MPV" defaultValue={vehicle?.type} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="code">Kode Unit</Label>
                            <Input id="code" placeholder="cth. AVZ-001" defaultValue={vehicle?.code} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="passengers">Jumlah Penumpang</Label>
                            <Input id="passengers" type="number" placeholder="cth. 7" defaultValue={vehicle?.passengers} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="transmission">Transmisi</Label>
                            <Select defaultValue={vehicle?.transmission}>
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
                            <Select defaultValue={vehicle?.fuel}>
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
                            <Input id="year" type="number" placeholder="cth. 2022" defaultValue={vehicle?.year} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="price">Harga Sewa / Hari</Label>
                            <Input id="price" type="number" placeholder="cth. 350000" defaultValue={vehicle?.price} />
                        </div>
                    </div>
                </div>
            </div>
             <DialogFooter className="pt-4 border-t px-6 pb-6 bg-background rounded-b-lg">
                <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit" onClick={handleSave}>
                    {vehicle ? "Simpan Perubahan" : "Simpan Kendaraan"}
                </Button>
            </DialogFooter>
        </>
    )
}

export default function ArmadaPage() {
  // Data is now managed by state, ready for API integration
  const [fleet, setFleet] = useState<Vehicle[]>(initialFleet); 
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const { toast } = useToast();

  const handleAddClick = () => {
    setSelectedVehicle(null);
    setFormOpen(true);
  }
  
  const handleEditClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormOpen(true);
  };
  
  const handleDelete = (vehicleToDelete: Vehicle) => {
    setFleet(prev => prev.filter(v => v.id !== vehicleToDelete.id));
    toast({
        title: "Berhasil Dihapus",
        description: `Kendaraan ${vehicleToDelete.brand} ${vehicleToDelete.name} telah dihapus.`,
    });
  };

  const handleFormSave = () => {
    // Here you would refetch the data from your API to update the list
    setFormOpen(false);
    setSelectedVehicle(null);
  }
  
  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedVehicle(null);
  }

  const dialogTitle = selectedVehicle ? "Edit Kendaraan" : "Tambahkan Armada Baru";
  const dialogDescription = selectedVehicle ? "Perbarui detail kendaraan di bawah ini." : "Isi detail kendaraan baru di bawah ini.";

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
