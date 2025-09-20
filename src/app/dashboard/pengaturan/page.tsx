
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ContactInfo } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";


const socialPlatforms = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'twitter', label: 'Twitter (X)' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'telegram', label: 'Telegram' },
] as const;

type SocialPlatformKey = typeof socialPlatforms[number]['value'];

type SocialLinkItem = {
    platform: SocialPlatformKey;
    url: string;
}

export default function PengaturanPage() {
  const { toast } = useToast();
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
      address: "Jl. Raya Kuta No. 123, Badung, Bali",
      email: "contact@mudakaryacarrent.com",
      whatsapp: "+62 812 3456 7890",
      maps: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31552.316868673754!2d115.15024474999999!3d-8.723613499999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd246bc2a594833%3A0x24443a99872e4242!2sKuta%2C%20Badung%20Regency%2C%20Bali%2C%20Indonesia!5e0!3m2!1sen!2sus!4v1722421343751!5m2!1sen!2sus",
      instagram: "https://instagram.com/mudakarya",
      facebook: "https://facebook.com/mudakarya",
      twitter: "https://twitter.com/mudakarya",
      tiktok: "",
      telegram: ""
  });
  
  // Convert the flat contactInfo social links into a list of objects for easier management
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>(() => 
    socialPlatforms
        .map(p => ({ platform: p.value, url: contactInfo[p.value] || '' }))
        .filter(item => item.url)
  );

   const [terms, setTerms] = useState({
      general: `Penyewa wajib memiliki dan menunjukkan SIM A yang masih berlaku.
Kerusakan yang disebabkan oleh kelalaian atau kesengajaan penyewa menjadi tanggung jawab penuh penyewa.
Dilarang keras menggunakan kendaraan untuk aktivitas ilegal, balapan, atau tindakan melanggar hukum lainnya.
Penggunaan kendaraan hanya diizinkan di wilayah yang telah disepakati dalam kontrak.
Keterlambatan pengembalian kendaraan akan dikenakan denda sesuai dengan ketentuan yang berlaku.
Penyewa bertanggung jawab atas semua biaya bahan bakar, tol, dan parkir selama masa sewa.`,
      payment: `Transfer Bank (BCA, Mandiri, BNI)
QRIS
Pembayaran tunai di kantor (dengan konfirmasi)`
   });

   const handleContactChange = (field: keyof Omit<ContactInfo, SocialPlatformKey>, value: string) => {
    setContactInfo(prev => ({ ...prev, [field]: value }));
   }
   
    const handleTermsChange = (field: keyof typeof terms, value: string) => {
    setTerms(prev => ({ ...prev, [field]: value }));
   }
   
   const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
       const newLinks = [...socialLinks];
       // @ts-ignore
       newLinks[index][field] = value;
       setSocialLinks(newLinks);
   }

   const addSocialLink = () => {
       setSocialLinks([...socialLinks, { platform: 'instagram', url: '' }]);
   }
   
   const removeSocialLink = (index: number) => {
       setSocialLinks(socialLinks.filter((_, i) => i !== index));
   }


  const handleSaveChanges = (type: 'Kontak' | 'S&K') => {
    // When saving, convert the socialLinks array back to the flat contactInfo structure
    if (type === 'Kontak') {
        const newContactInfo = { ...contactInfo };
        // Reset all social fields first
        socialPlatforms.forEach(p => newContactInfo[p.value] = '');
        // Then populate from the socialLinks array
        socialLinks.forEach(link => {
            if (link.platform && link.url) {
                newContactInfo[link.platform] = link.url;
            }
        });
        setContactInfo(newContactInfo);
        // Here you would send newContactInfo to your backend
    }
    
    // In a real app, you would send this data to your backend API
    toast({
        title: "Perubahan Disimpan",
        description: `Informasi ${type} telah berhasil diperbarui.`
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
        <p className="text-muted-foreground">
          Kelola informasi website dan akun Anda.
        </p>
      </div>

      <Tabs defaultValue="kontak" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="kontak">Kontak & Media Sosial</TabsTrigger>
            <TabsTrigger value="sk">Syarat & Ketentuan</TabsTrigger>
        </TabsList>
        <TabsContent value="kontak" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Informasi Kontak & Alamat</CardTitle>
                    <CardDescription>Perbarui detail yang ditampilkan di halaman Kontak.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="address">Alamat Kantor</Label>
                        <Input id="address" value={contactInfo.address} onChange={(e) => handleContactChange('address', e.target.value)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={contactInfo.email} onChange={(e) => handleContactChange('email', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp</Label>
                            <Input id="whatsapp" value={contactInfo.whatsapp} onChange={(e) => handleContactChange('whatsapp', e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="maps">Embed URL Google Maps</Label>
                        <Textarea id="maps" rows={4} value={contactInfo.maps} onChange={(e) => handleContactChange('maps', e.target.value)} />
                         <p className="text-xs text-muted-foreground">Salin URL dari opsi "Embed a map" di Google Maps.</p>
                    </div>
                     {contactInfo.maps && (
                        <div className="space-y-2">
                            <Label>Pratinjau Peta</Label>
                            <div className="aspect-video w-full overflow-hidden rounded-lg border">
                                <iframe
                                    key={contactInfo.maps} // Re-render iframe when URL changes
                                    src={contactInfo.maps}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen={true}
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Tautan Media Sosial</CardTitle>
                    <CardDescription>Kelola tautan profil media sosial Anda.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {socialLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <Select
                                value={link.platform}
                                onValueChange={(value) => handleSocialLinkChange(index, 'platform', value)}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Pilih Platform" />
                                </SelectTrigger>
                                <SelectContent>
                                    {socialPlatforms.map(p => (
                                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input 
                                value={link.url}
                                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                placeholder="https://..."
                                className="flex-grow"
                            />
                            <Button variant="ghost" size="icon" onClick={() => removeSocialLink(index)} aria-label="Hapus tautan">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                     <Button variant="outline" size="sm" onClick={addSocialLink} className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Tautan
                    </Button>
                </CardContent>
            </Card>
            <Button onClick={() => handleSaveChanges('Kontak')} className="mt-6">Simpan Perubahan Kontak & Medsos</Button>
        </TabsContent>
        <TabsContent value="sk" className="mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Syarat & Ketentuan</CardTitle>
                    <CardDescription>Atur poin-poin syarat dan ketentuan sewa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label>Persyaratan Umum</Label>
                        <Textarea rows={8} value={terms.general} onChange={(e) => handleTermsChange('general', e.target.value)} />
                        <p className="text-xs text-muted-foreground">Setiap baris akan menjadi satu poin persyaratan.</p>
                    </div>
                     <div className="space-y-2">
                        <Label>Metode Pembayaran</Label>
                         <Textarea rows={4} value={terms.payment} onChange={(e) => handleTermsChange('payment', e.target.value)} />
                        <p className="text-xs text-muted-foreground">Setiap baris akan menjadi satu poin metode pembayaran.</p>
                    </div>
                    <Button onClick={() => handleSaveChanges('S&K')}>Simpan Perubahan S&K</Button>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
}
