'use server';

import { createServiceRoleClient, uploadImageFromDataUri } from '@/utils/supabase/server';
import type { Promotion, Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { upsertVehicle, type VehicleFormData } from '../armada/actions';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';

export async function upsertPromotion(promoData: Omit<Promotion, 'created_at'>, vehicles: Vehicle[], discount?: number) {
    const supabase = createServiceRoleClient();
    
    if (promoData.imageUrl && promoData.imageUrl.startsWith('data:image')) {
        try {
            promoData.imageUrl = await uploadImageFromDataUri(promoData.imageUrl, 'promotions', `promo-${promoData.id}`);
        } catch (uploadError) {
            console.error("Promotion image upload failed:", uploadError);
            return { data: null, error: { message: (uploadError as Error).message } };
        }
    }
    
    const { data, error } = await supabase.from('promotions').upsert(promoData, { onConflict: 'id' }).select().single();
    if (error) {
        console.error('Error upserting promotion:', error);
        return { data: null, error };
    }

    // Apply discount to the selected vehicle
    if (promoData.vehicleId && promoData.vehicleId !== 'none') {
        const vehicleToUpdate = vehicles.find(v => v.id === promoData.vehicleId);
        if (vehicleToUpdate) {
            const updatedVehicle: VehicleFormData = { 
                ...vehicleToUpdate, 
                price: vehicleToUpdate.price ?? 0,
                year: vehicleToUpdate.year,
                passengers: vehicleToUpdate.passengers,
                stock: vehicleToUpdate.stock,
                discountPercentage: discount || null,
                rating: vehicleToUpdate.rating
             };
            await upsertVehicle(updatedVehicle);
        }
    }

    revalidatePath(`/${adminPath}/promosi`);
    revalidatePath('/'); // Revalidate home page where promotions are shown
    return { data, error: null };
}


export async function deletePromotion(promo: Promotion, vehicles: Vehicle[]) {
    const supabase = createServiceRoleClient();

    const { data: itemData, error: fetchError } = await supabase.from('promotions').select('imageUrl').eq('id', promo.id).single();
    if (fetchError) {
        console.error("Error fetching promotion for deletion:", fetchError);
        return { error: fetchError };
    }

    const { error } = await supabase.from('promotions').delete().eq('id', promo.id);
    if (error) {
        console.error('Error deleting promotion:', error);
        return { error };
    }

    if(itemData.imageUrl) {
        try {
            const bucketName = 'mudakarya-bucket';
            const urlParts = itemData.imageUrl.split('/');
            const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
            await supabase.storage.from(bucketName).remove([filePath]);
        } catch(storageError) {
            console.error("Error deleting from storage, but continuing:", storageError);
        }
    }
    
    // Also remove discount from vehicle if it was linked
    if (promo.vehicleId) {
        const vehicleToUpdate = vehicles.find(v => v.id === promo.vehicleId);
        if(vehicleToUpdate) {
            const updatedVehicle: VehicleFormData = { 
                ...vehicleToUpdate, 
                price: vehicleToUpdate.price ?? 0,
                year: vehicleToUpdate.year,
                passengers: vehicleToUpdate.passengers,
                stock: vehicleToUpdate.stock,
                discountPercentage: null,
                rating: vehicleToUpdate.rating
            };
            await upsertVehicle(updatedVehicle);
        }
    }

    revalidatePath(`/${adminPath}/promosi`);
    revalidatePath('/'); // Revalidate home page
    return { error: null };
}
