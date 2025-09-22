

'use client';

import { useState, ChangeEvent } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { MoreHorizontal, PlusCircle, Star, Trash2, Upload } from "lucide-react";
import type { Testimonial, GalleryItem } from '@/lib/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';


function TestimonialForm({ testimonial, onSave, onCancel }: { testimonial?: Testimonial | null, onSave: () => void, onCancel: () => void }) {
    const { toast } = useToast();

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
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="customerName">Nama Pelanggan</Label>
                    <Input id="customerName" placeholder="cth. Budi Santoso" defaultValue={testimonial?.customerName} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="vehicleName">Mobil yang Disewa</Label>
                    <Input id="vehicleName" placeholder="cth. Toyota Avanza" defaultValue={testimonial?.vehicleName} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="rating">Rating (1-5)</Label>
                    <Input id="rating" type="number" max="5" min="1" placeholder="cth. 5" defaultValue={testimonial?.rating} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="comment">Komentar</Label>
                    <Textarea id="comment" placeholder="Tulis komentar testimoni di sini..." defaultValue={testimonial?.comment} />
                </div>
            </div>
            <DialogFooter>
                 <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit" onClick={handleSave}>{testimonial ? "Simpan Perubahan" : "Simpan Testimoni"}</Button>
            </DialogFooter>
        </>
    )
}

function GalleryEditor() {
    // Data is now managed by state, ready for API integration
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [isAddPhotoOpen, setAddPhotoOpen] = useState(false);
    const { toast } = useToast();
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleAddPhoto = () => {
        // API call to upload and add photo
        toast({
            title: "Foto Ditambahkan",
            description: "Foto baru telah ditambahkan ke galeri."
        });
        setAddPhotoOpen(false);
        setPreviewUrl(null);
    };

    const handleDeletePhoto = (photo: GalleryItem) => {
        setGallery(prev => prev.filter(p => p.id !== photo.id));
        toast({
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
                <Dialog open={isAddPhotoOpen} onOpenChange={(isOpen) => { setAddPhotoOpen(isOpen); if(!isOpen) setPreviewUrl(null); }}>
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


export default function TestimoniPage() {
  // Data is now managed by state, ready for API integration
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isFormOpen, setFormOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);
  const { toast } = useToast();

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
        title: "Testimoni Dihapus",
        description: `Testimoni dari ${testimonial.customerName} telah dihapus.`
    })
  };
  
  const handleFormSave = () => {
    setFormOpen(false);
    setSelectedTestimonial(null);
    // Here you would refetch data from your API
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setSelectedTestimonial(null);
  };

  const dialogTitle = selectedTestimonial ? "Edit Testimoni" : "Tambahkan Testimoni Baru";
  const dialogDescription = selectedTestimonial ? "Perbarui detail testimoni di bawah ini." : "Isi detail testimoni baru di bawah ini.";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Testimoni</h1>
          <p className="text-muted-foreground">
            Kelola semua testimoni dan galeri dari pelanggan Anda.
          </p>
        </div>
        <Button onClick={handleAddClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambahkan Testimoni
        </Button>
      </div>

       <Card>
        <CardHeader>
          <CardTitle>Daftar Testimoni</CardTitle>
          <CardDescription>Berikut adalah semua testimoni yang telah masuk.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pelanggan</TableHead>
                <TableHead>Komentar</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>
                    <span className="sr-only">Aksi</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testimonials.length > 0 ? (
                testimonials.map((item) => (
                    <TableRow key={item.id}>
                    <TableCell className="font-medium">
                        {item.customerName}
                        <p className='text-sm text-muted-foreground font-normal'>Sewa: {item.vehicleName}</p>
                    </TableCell>
                    <TableCell className="max-w-sm">
                        <p className='text-muted-foreground line-clamp-2'>{item.comment}</p>
                    </TableCell>
                    <TableCell className="text-center">
                        <div className="flex justify-center items-center gap-1">
                            <span className="font-bold">{item.rating}</span>
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        </div>
                    </TableCell>
                    <TableCell>
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
                    <TableCell colSpan={4} className="h-24 text-center">
                        Belum ada testimoni.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
       <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
         <DialogContent className="sm:max-w-xl">
            <DialogHeader>
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

       <GalleryEditor />

    </div>
  );
}
