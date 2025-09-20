
'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { LanguageProvider } from "@/app/language-provider";
import { useState, useEffect } from "react";
import type { TermsContent } from "@/lib/types";


function TermsPageContent() {
    const { dictionary } = useLanguage();
    // In a real app, this would be fetched from a database/CMS.
    // For now, we simulate fetching it and storing it in state.
    const [termsContent, setTermsContent] = useState<TermsContent | null>(null);

    useEffect(() => {
        const fetchedTerms = {
            general: `Penyewa wajib memiliki dan menunjukkan SIM A yang masih berlaku.
Kerusakan yang disebabkan oleh kelalaian atau kesengajaan penyewa menjadi tanggung jawab penuh penyewa.
Dilarang keras menggunakan kendaraan untuk aktivitas ilegal, balapan, atau tindakan melanggar hukum lainnya.
Penggunaan kendaraan hanya diizinkan di wilayah yang telah disepakati dalam kontrak.
Keterlambatan pengembalian kendaraan akan dikenakan denda sesuai dengan ketentuan yang berlaku.
Penyewa bertanggung jawab atas semua biaya bahan bakar, tol, dan parkir selama masa sewa.`,
            payment: `Transfer Bank (BCA, Mandiri, BNI)
QRIS
Pembayaran tunai di kantor (dengan konfirmasi)`
        };
        setTermsContent(fetchedTerms);
    }, []);

    if (!termsContent) {
        return <div className="container py-16 text-center">{dictionary.loading}...</div>
    }

    const generalTermsList = termsContent.general.split('\n').filter(line => line.trim() !== '');
    const paymentMethodsList = termsContent.payment.split('\n').filter(line => line.trim() !== '');

    return (
            <div className="bg-muted/30">
                <div className="container py-8 md:py-16">
                     <div className="text-center mb-12 max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold tracking-tight">{dictionary.terms.title}</h1>
                        <p className="mt-4 text-lg text-muted-foreground">{dictionary.terms.description}</p>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle>{dictionary.terms.general.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <ul className="space-y-3">
                                    {generalTermsList.map((term: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                                        <span>{term}</span>
                                    </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="mt-8">
                            <CardHeader>
                                <CardTitle>{dictionary.terms.payment.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">{dictionary.terms.payment.description}</p>
                                <ul className="list-disc list-inside space-y-2">
                                    {paymentMethodsList.map((method: string, index: number) => (
                                        <li key={index}>{method}</li>
                                    ))}
                                </ul>
                                <p className="text-sm text-muted-foreground mt-6">{dictionary.terms.payment.downPayment}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
    )
}

export default function TermsPage() {
    return (
        <LanguageProvider>
            <TermsPageContent />
        </LanguageProvider>
    )
}
