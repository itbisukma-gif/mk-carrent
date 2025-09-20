'use client';

import { useState, ChangeEvent, useMemo } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, PlusCircle, Star, Trash2, Upload, Edit } from "lucide-react";
import type { Testimonial, GalleryItem, FeatureItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { testimonials as initialTestimonials, gallery as initialGallery, fleet, features as initialFeatures } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StarRating } from '@/components/star-rating';
import { LanguageProvider } from '@/app/language-provider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


function TestimonialForm({ testimonial, onSave, onCancel }: { testimonial?: Testimonial | null, onSave: () => void, onCancel: () => void }) {
    const { toast } = useToast();
    const [rating, setRating] = useState(testimonial?.rating || 0);

    const handleSave = () => {
        // API call to save testimonial
        toast({
            title: testimonial ? "Testimoni Diperbarui" : "Testimoni Ditambahkan",
            description: "Testimoni telah berhasil disimpan.",
        });
        onSave();
    };

    return (
        <>
            <div className="max-h-[70vh] overflow-y-auto px-1 pr-4">
                <div className="grid gap-6 py-4 px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="customerName">Nama Pelanggan</Label>
                            <Input id="customerName" placeholder="cth. Budi Santoso" defaultValue={testimonial?.customerName} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="vehicleName">Mobil yang Disewa</Label>
                             <Select defaultValue={testimonial?.vehicleName}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih mobil..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {fleet.map((vehicle) => (
                                        <SelectItem key={vehicle.id} value={`${vehicle.brand} ${vehicle.name}`}>
                                            {vehicle.brand} {vehicle.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Rating</Label>
                        <div className="flex items-center gap-2 rounded-md border p-3">
                            <p className="text-sm font-medium">Berikan rating (1-5):</p>
                            <LanguageProvider>
                                <StarRating rating={rating} onRatingChange={setRating} />
                            </LanguageProvider>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="comment">Komentar</Label>
                        <Textarea id="comment" placeholder="Tulis komentar testimoni di sini..." defaultValue={testimonial?.comment} />
                    </div>
                </div>
            </div>
            <DialogFooter className="pt-4 border-t px-6 pb-6 bg-background rounded-b-lg">
                 <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit" onClick={handleSave}>{testimonial ? "Simpan Perubahan" : "Simpan Testimoni"}</Button>
            </DialogFooter>
        </>
    )
}

function FeatureForm({ feature, onSave, onCancel }: { feature?: FeatureItem | null, onSave: (feature: FeatureItem) => void, onCancel: () => void }) {
    const { toast } = useToast();
    const [title, setTitle] = useState(feature?.title || '');
    const [description, setDescription] = useState(feature?.description || '');
    const [previewUrl, setPreviewUrl] = useState<string | null>(feature?.imageUrl || null);
    
    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSave = () => {
        if (!title || !description || !previewUrl) {
            toast({ variant: 'destructive', title: 'Formulir tidak lengkap' });
            return;
        }

        const newFeature: FeatureItem = {
            id: feature?.id || `feat-${Date.now()}`,
            title,
            description,
            imageUrl: previewUrl,
            dataAiHint: feature?.dataAiHint || 'feature illustration'
        };

        onSave(newFeature);
    };
    
    return (
        <>
             <div className="max-h-[70vh] overflow-y-auto px-1 pr-4">
                <div className="grid gap-6 py-4 px-6">
                    <div className="space-y-2">
                        <Label htmlFor="feature-title">Judul Keunggulan</Label>
                        <Input id="feature-title" placeholder="cth. Unit Selalu Bersih" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="feature-description">Deskripsi Singkat</Label>
                        <Textarea id="feature-description" placeholder="Jelaskan keunggulan layanan Anda..." value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Foto Ilustrasi</Label>
                        {previewUrl && (
                            <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                <Image src={previewUrl} alt="Pratinjau" fill className="object-cover" />
                            </div>
                        )}
                        <Label htmlFor="feature-upload" className={cn("w-full cursor-pointer", "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", "border border-input bg-background hover:bg-accent hover:text-accent-foreground", "h-10 px-4 py-2")}>
                            <Upload className="mr-2 h-4 w-4" />
                            {previewUrl ? "Ganti Foto..." : "Pilih File Foto..."}
                        </Label>
                        <Input id="feature-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                    </div>
                </div>
            </div>
             <DialogFooter className="pt-4 border-t px-6 pb-6 bg-background rounded-b-lg">
                <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button onClick={handleSave}>{feature ? "Simpan Perubahan" : "Simpan Keunggulan"}</Button>
            </DialogFooter>
        </>
    );
}


function GalleryEditor() {
    const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
    const [isAddPhotoOpen, setAddPhotoOpen] = useState(false);
    const { toast } = useToast();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedVehicleName, setSelectedVehicleName] = useState<string | undefined>(undefined);


    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddPhoto = () => {
        if (!previewUrl) return;

        const newPhoto: GalleryItem = {
            id: `gal-${Date.now()}`,
            url: previewUrl,
            vehicleName: selectedVehicleName,
        };
        
        setGallery(prev => [newPhoto, ...prev]);

        toast({
            title: "Foto Ditambahkan",
            description: "Foto baru telah ditambahkan ke galeri."
        });
        setAddPhotoOpen(false);
        setPreviewUrl(null);
        setSelectedVehicleName(undefined);
    };

    const handleDeletePhoto = (photo: GalleryItem) => {
        setGallery(prev => prev.filter(p => p.id !== photo.id));
        toast({
            variant: "destructive",
            title: "Foto Dihapus",
            description: `Foto dengan ID ${photo.id} telah dihapus dari galeri.`
        })
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Galeri Foto Pelanggan</CardTitle>
                    <CardDescription>Kelola foto-foto yang ditampilkan di halaman testimoni.</CardDescription>
                </div>
                <Dialog open={isAddPhotoOpen} onOpenChange={(isOpen) => { setAddPhotoOpen(isOpen); if(!isOpen) { setPreviewUrl(null); setSelectedVehicleName(undefined); } }}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Tambah Foto
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Tambah Foto Baru</DialogTitle>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="vehicleName">Tautkan ke Mobil (Opsional)</Label>
                                <Select onValueChange={setSelectedVehicleName}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih mobil..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {fleet.map((vehicle) => (
                                            <SelectItem key={vehicle.id} value={`${vehicle.brand} ${vehicle.name}`}>
                                                {vehicle.brand} {vehicle.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {previewUrl && (
                                <div className="relative aspect-video w-full rounded-md overflow-hidden border">
                                    <Image src={previewUrl} alt="Pratinjau Foto" fill className="object-cover" />
                                </div>
                            )}
                             <Label htmlFor="photo-upload" className={cn("w-full cursor-pointer", "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", "border border-input bg-background hover:bg-accent hover:text-accent-foreground", "h-10 px-4 py-2")}>
                                <Upload className="mr-2 h-4 w-4" />
                                {previewUrl ? "Pilih Foto Lain..." : "Pilih File Foto..."}
                            </Label>
                            <Input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleFileChange}/>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleAddPhoto} disabled={!previewUrl}>Upload & Simpan</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                {gallery.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {gallery.map((photo) => (
                             <div key={photo.id} className="relative group aspect-square">
                                <Image
                                    src={photo.url}
                                    alt="Foto galeri pelanggan"
                                    fill
                                    className="object-cover rounded-lg border"
                                    data-ai-hint="customer photo"
                                />
                                {photo.vehicleName && (
                                    <Badge variant="secondary" className="absolute bottom-1 left-1 text-xs">{photo.vehicleName}</Badge>
                                )}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Hapus foto</span>
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Tindakan ini akan menghapus foto ini dari galeri secara permanen.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Batal</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDeletePhoto(photo)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                             </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-semibold">Galeri Masih Kosong</h3>
                        <p className="text-sm text-muted-foreground mt-1">Tambahkan foto pertama Anda.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FeatureEditor() {
    const [features, setFeatures] = useState<FeatureItem[]>(initialFeatures);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<FeatureItem | null>(null);
    const { toast } = useToast();

    const handleAddClick = () => {
        setSelectedFeature(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (feature: FeatureItem) => {
        setSelectedFeature(feature);
        setIsFormOpen(true);
    };

    const handleFormSave = (featureData: FeatureItem) => {
        if (selectedFeature) {
            setFeatures(prev => prev.map(f => f.id === featureData.id ? featureData : f));
        } else {
            setFeatures(prev => [...prev, featureData]);
        }
        setIsFormOpen(false);
        setSelectedFeature(null);
        toast({ title: "Keunggulan Disimpan", description: `Keunggulan "${featureData.title}" telah disimpan.` });
    };

    const handleDelete = (feature: FeatureItem) => {
        setFeatures(prev => prev.filter(f => f.id !== feature.id));
        toast({ variant: "destructive", title: "Keunggulan Dihapus" });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Keunggulan Layanan</CardTitle>
                    <CardDescription>Kelola poin-poin keunggulan yang ditampilkan di halaman utama.</CardDescription>
                </div>
                <Button onClick={handleAddClick} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Keunggulan
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {features.length > 0 ? features.map(feature => (
                    <div key={feature.id} className="flex items-center gap-4 border rounded-lg p-3">
                        <Image src={feature.imageUrl} alt={feature.title} width={120} height={80} className="rounded-md object-cover aspect-video bg-muted" />
                        <div className="flex-grow">
                            <h4 className="font-bold">{feature.title}</h4>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="outline" size="icon" onClick={() => handleEditClick(feature)}>
                                <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini akan menghapus keunggulan "{feature.title}".
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(feature)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )) : (
                     <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <h3 className="text-lg font-semibold">Belum Ada Keunggulan</h3>
                        <p className="text-sm text-muted-foreground mt-1">Tambahkan poin keunggulan pertama Anda.</p>
                    </div>
                )}
            </CardContent>

             <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                 <DialogContent className="sm:max-w-lg p-0">
                    <DialogHeader className="p-6 pb-0">
                        <DialogTitle>{selectedFeature ? "Edit Keunggulan" : "Tambah Keunggulan"}</DialogTitle>
                    </DialogHeader>
                    <FeatureForm 
                        feature={selectedFeature} 
                        onSave={handleFormSave}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}

export default function TestimoniPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const { toast } = useToast();

  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredTestimonials = useMemo(() => {
    if (filter === 'all') {
      return testimonials;
    }
    return testimonials.filter(t => t.vehicleName === filter);
  }, [testimonials, filter]);

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTestimonials.slice(indexOfFirstItem, indexOfLastItem);
  
  const handleFilterChange = (value: string) => {
    setFilter(value);
    setCurrentPage(1); // Reset to first page on filter change
  };


  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };


  const handleEditClick = (testimonial: Testimonial) => {
    setSelectedTestimonial(testimonial);
    setFormOpen(true);
  };
  
  const handleAddClick = () => {
    setSelectedTestimonial(null);
    setFormOpen(true);
  };

  const handleDelete = (testimonial: Testimonial) => {
    setTestimonials(prev => prev.filter(t => t.id !== testimonial.id));
    toast({
        variant: "destructive",
        title: "Testimoni Dihapus",
        description: `Testimoni dari ${testimonial.customerName} telah dihapus.`
    })
  };
  
  const handleFormSave = () => {
    // Here you would refetch the data from your API to update the list
    setFormOpen(false);
    setSelectedTestimonial(null);
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedTestimonial(null);
  };

  const dialogTitle = selectedTestimonial ? "Edit Testimoni" : "Tambahkan Testimoni Baru";
  const dialogDescription = selectedTestimonial ? "Perbarui detail testimoni di bawah ini." : "Isi detail testimoni baru di bawah ini.";

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Testimoni & Keunggulan</h1>
        <p className="text-muted-foreground">
          Kelola semua testimoni, galeri, dan poin keunggulan dari layanan Anda.
        </p>
      </div>
      
       <Tabs defaultValue="testimonials">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="testimonials">Ulasan Pelanggan</TabsTrigger>
                <TabsTrigger value="gallery">Galeri Foto</TabsTrigger>
                <TabsTrigger value="features">Kelola Keunggulan</TabsTrigger>
            </TabsList>

            <TabsContent value="testimonials" className="mt-6">
                 <Card>
                    <CardHeader>
                        <CardTitle>Daftar Testimoni</CardTitle>
                        <CardDescription>Berikut adalah semua testimoni yang akan ditampilkan di halaman detail mobil.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                          <Select value={filter} onValueChange={handleFilterChange}>
                              <SelectTrigger className="w-full sm:w-[240px]">
                                  <SelectValue placeholder="Filter berdasarkan mobil" />
                              </SelectTrigger>
                              <SelectContent>
                                  <SelectItem value="all">Tampilkan Semua Mobil</SelectItem>
                                  {fleet.map((vehicle) => (
                                      <SelectItem key={vehicle.id} value={`${vehicle.brand} ${vehicle.name}`}>
                                          {vehicle.brand} {vehicle.name}
                                      </SelectItem>
                                  ))}
                              </SelectContent>
                          </Select>
                          <Button onClick={handleAddClick} className="w-full sm:w-auto">
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Tambah Testimoni
                          </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama Pelanggan</TableHead>
                            <TableHead>Mobil yang Disewa</TableHead>
                            <TableHead>Komentar</TableHead>
                            <TableHead className="text-center">Rating</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                                <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.customerName}</TableCell>
                                <TableCell>{item.vehicleName}</TableCell>
                                <TableCell className="max-w-xs truncate italic text-muted-foreground">"{item.comment}"</TableCell>
                                <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" /> 
                                        <span className="font-semibold">{item.rating}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <MoreHorizontal className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                        <DropdownMenuItem onSelect={() => handleEditClick(item)}>Edit</DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className='text-destructive' onSelect={(e) => e.preventDefault()}>Hapus</DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Tindakan ini akan menghapus testimoni dari <span className="font-bold">{item.customerName}</span> secara permanen.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Batal</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(item)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                                </TableRow>
                            ))
                          ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Belum ada testimoni.
                                </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                     <CardFooter className="flex items-center justify-end space-x-4 py-4">
                        <span className="text-sm text-muted-foreground">
                            Halaman {currentPage} dari {totalPages > 0 ? totalPages : 1}
                        </span>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                Sebelumnya
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || totalPages === 0}
                            >
                                Berikutnya
                            </Button>
                        </div>
                    </CardFooter>
                  </Card>
            </TabsContent>

             <TabsContent value="gallery" className="mt-6">
                <GalleryEditor />
            </TabsContent>

             <TabsContent value="features" className="mt-6">
                <FeatureEditor />
            </TabsContent>

       </Tabs>
      
       <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
         <DialogContent className="sm:max-w-xl p-0">
            <DialogHeader className="p-6 pb-0">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            <TestimonialForm 
                testimonial={selectedTestimonial}
                onSave={handleFormSave}
                onCancel={handleFormCancel}
            />
        </DialogContent>
       </Dialog>
    </div>
  );
}
