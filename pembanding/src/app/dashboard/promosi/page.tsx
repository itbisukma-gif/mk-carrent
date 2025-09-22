

'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wand2, Sparkles, Check } from "lucide-react";
import { fleet as initialFleet } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { generatePromoText } from '@/ai/flows/generate-promo-text';
import { Input } from '@/components/ui/input';
import type { Vehicle } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PromosiPage() {
    const [fleet, setFleet] = useState<Vehicle[]>(initialFleet);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | undefined>();
    const [discountPercentage, setDiscountPercentage] = useState<number>(10);
    const [promoText, setPromoText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const selectedVehicle = fleet.find(v => v.id === selectedVehicleId);

    const handleGenerateText = async () => {
        if (!selectedVehicle) {
            toast({
                variant: 'destructive',
                title: 'Gagal Menghasilkan Teks',
                description: 'Silakan pilih kendaraan terlebih dahulu.',
            });
            return;
        }
        setIsLoading(true);
        setPromoText('');

        try {
            const prompt = `Buat teks promosi untuk mobil ${selectedVehicle.brand} ${selectedVehicle.name} (${selectedVehicle.type}) dengan harga sewa normal Rp${selectedVehicle.price.toLocaleString('id-ID')} per hari. Berikan diskon sebesar ${discountPercentage}%. Teks harus menarik, singkat, dan mengajak pelanggan untuk menyewa.`;
            const stream = await generatePromoText(prompt);
            for await (const delta of stream) {
                setPromoText(prev => prev + delta);
            }
             toast({
                title: 'Teks Promo Dihasilkan!',
                description: 'Teks promosi berhasil dibuat oleh AI.',
            });
        } catch (error) {
            console.error('Error generating promo text:', error);
            toast({
                variant: 'destructive',
                title: 'Terjadi Kesalahan',
                description: 'Gagal menghasilkan teks promosi. Silakan coba lagi.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApplyPromo = () => {
        if (!selectedVehicleId) return;
        setFleet(prevFleet => 
            prevFleet.map(v => 
                v.id === selectedVehicleId 
                ? { ...v, discountPercentage: discountPercentage } 
                : v
            )
        );
        toast({
            title: "Promosi Diterapkan!",
            description: `Diskon ${discountPercentage}% telah diterapkan pada ${selectedVehicle?.name}.`
        })
    };


    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Editor Promosi</h1>
                <p className="text-muted-foreground">
                    Gunakan AI untuk membuat teks promosi yang menarik untuk kendaraan Anda.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Generator Teks Promosi</CardTitle>
                    <CardDescription>
                        Pilih kendaraan dan masukkan persentase diskon, lalu biarkan AI membuat copy marketing untuk Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="vehicle">Pilih Kendaraan</Label>
                            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih mobil untuk dipromosikan" />
                                </SelectTrigger>
                                <SelectContent>
                                    {fleet.map(vehicle => (
                                        <SelectItem key={vehicle.id} value={vehicle.id}>
                                            {vehicle.brand} {vehicle.name} {vehicle.discountPercentage ? `(${vehicle.discountPercentage}% off)`: ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discount">Persentase Diskon</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    id="discount"
                                    type="number"
                                    value={discountPercentage}
                                    onChange={(e) => setDiscountPercentage(Number(e.target.value))}
                                    placeholder="cth. 15"
                                    className="w-24"
                                />
                                <span className="font-semibold text-lg">%</span>
                            </div>
                        </div>
                    </div>

                    <Button onClick={handleGenerateText} disabled={isLoading || !selectedVehicleId}>
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isLoading ? 'Menghasilkan...' : 'Buat Teks Promosi'}
                    </Button>

                    <div className="space-y-2">
                        <Label htmlFor="promo-text">Hasil Teks Promosi</Label>
                        <Textarea
                            id="promo-text"
                            placeholder="Hasil teks promosi dari AI akan muncul di sini..."
                            value={promoText}
                            onChange={(e) => setPromoText(e.target.value)}
                            rows={8}
                            className="bg-muted/50"
                        />
                         {promoText && (
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>Terapkan Promosi?</AlertTitle>
                                <AlertDescription className='flex items-center justify-between'>
                                   <span>Terapkan diskon {discountPercentage}% ke {selectedVehicle?.name} dan simpan perubahan?</span>
                                    <Button size="sm" onClick={handleApplyPromo}>
                                        <Check className="h-4 w-4 mr-2" />
                                        Ya, Terapkan
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
