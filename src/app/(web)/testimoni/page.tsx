

'use client'

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { gallery, testimonials } from "@/lib/data";
import { Star, UserCircle } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/hooks/use-language";
import { LanguageProvider } from "@/app/language-provider";
import { FeaturesSection } from "@/components/features-section";

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );
}

function TestimonialsPageContent() {
    const { dictionary } = useLanguage();

    return (
        <>
            <div className="container py-8 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">{dictionary.testimonials.title}</h1>
                    <p className="mt-4 text-lg text-muted-foreground">{dictionary.testimonials.description}</p>
                </div>

                <Tabs defaultValue="comments" className="max-w-4xl mx-auto">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="comments">{dictionary.testimonials.tabs.reviews}</TabsTrigger>
                        <TabsTrigger value="gallery">{dictionary.testimonials.tabs.gallery}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="comments" className="mt-8">
                        <div className="space-y-6">
                            {testimonials.map((item) => (
                                <Card key={item.id}>
                                    <CardHeader>
                                        <div className="flex items-start gap-4">
                                            <UserCircle className="h-12 w-12 text-muted-foreground flex-shrink-0" />
                                            <div className="w-full">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-semibold text-lg">{item.customerName}</h3>
                                                        <p className="text-sm text-muted-foreground">{dictionary.testimonials.rented} {item.vehicleName}</p>
                                                    </div>
                                                    <StarRating rating={item.rating} />
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground pl-16">"{item.comment}"</p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                    <TabsContent value="gallery" className="mt-8">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {gallery.map((photo) => (
                                <div key={photo.id} className="relative group aspect-square">
                                    <Image
                                        src={photo.url}
                                        alt={dictionary.testimonials.galleryAlt}
                                        fill
                                        className="object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
                                        data-ai-hint="customer photo"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                        <p className="text-white text-center text-sm p-2">{dictionary.testimonials.galleryHover}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
            <div className="mt-8 md:mt-0">
                <FeaturesSection />
            </div>
        </>
    )
}

export default function TestimonialsPage() {
    return (
        <LanguageProvider>
            <TestimonialsPageContent />
        </LanguageProvider>
    )
}

