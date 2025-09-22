import { notFound } from 'next/navigation';
import { fleet } from '@/lib/data';
import { LanguageProvider } from '@/app/language-provider';
import { VehicleDetailClient } from '@/components/vehicle-detail-client';

interface MobilDetailPageProps {
  params: {
    id: string;
  };
}

export default async function MobilDetailPage({ params }: MobilDetailPageProps) {
  const vehicle = fleet.find((car) => car.id === params.id);

  if (!vehicle) {
    notFound();
  }

  return (
    <LanguageProvider>
      <VehicleDetailClient vehicle={vehicle} />
    </LanguageProvider>
  );
}
