
import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import { WebHeader } from '@/components/layout/web-header';
import { WebFooter } from '@/components/layout/web-footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { dictionaries } from '@/lib/dictionaries';

async function getTermsContent() {
    const supabase = createClient();
    const { data, error } = await supabase
        .from('terms_content')
        .select('*')
        .single();

    if (error || !data) {
        notFound();
    }
    return data;
}

export default async function TermsAndConditionsPage() {
    const terms = await getTermsContent();
    const dict = dictionaries['id'].terms; // Using 'id' for now

    const generalPoints = terms.general.split('\n').filter(p => p.trim() !== '');
    const paymentPoints = terms.payment.split('\n').filter(p => p.trim() !== '');

    return (
        <div className="flex flex-col min-h-screen">
            <WebHeader />
            <main className="flex-1 bg-muted/30">
                <div className="container py-8 md:py-16">
                     <div className="text-center mb-12 max-w-2xl mx-auto">
                        <h1 className="text-4xl font-bold tracking-tight">{dict.title}</h1>
                        <p className="mt-4 text-lg text-muted-foreground">{dict.description}</p>
                    </div>

                    <div className="max-w-4xl mx-auto space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>{dict.general.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {generalPoints.map((point, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                                            <span className="text-muted-foreground">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>{dict.payment.title}</CardTitle>
                                <CardDescription>{dict.payment.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                 <ul className="space-y-3">
                                    {paymentPoints.map((point, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                                            <span className="text-muted-foreground">{point}</span>
                                        </li>
                                    ))}
                                    <li className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0"/>
                                        <span className="text-muted-foreground">{dict.payment.downPayment}</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <WebFooter />
        </div>
    )
}
