'use server';

import { createServiceRoleClient, uploadImageFromDataUri } from '@/utils/supabase/server';
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';

// Define a specific type for form data to handle potential string values from the form
export type VehicleFormData = Omit<Vehicle, 'price' | 'year' | 'passengers' | 'stock' | 'discountPercentage' | 'rating'> & {
    price: string | number;
    year: string | number | null;
    passengers: string | number | null;
    stock: string | number | null;
    discountPercentage: string | number | null;
    rating: number | null;
};


export async function upsertVehicle(vehicleData: VehicleFormData) {
    const supabase = createServiceRoleClient();

    // Create a mutable copy to potentially update the photo URL
    let vehicleToUpsert: Vehicle = {
        ...vehicleData,
        price: Number(vehicleData.price) || 0,
        year: vehicleData.year ? Number(vehicleData.year) : null,
        passengers: vehicleData.passengers ? Number(vehicleData.passengers) : null,
        stock: vehicleData.unitType === 'khusus' ? (vehicleData.stock ? Number(vehicleData.stock) : null) : null,
        discountPercentage: vehicleData.discountPercentage ? Number(vehicleData.discountPercentage) : null,
        status: vehicleData.status || 'tersedia',
        rating: vehicleData.rating || 5, // Default rating
    };

    // --- LOGIC FIX: Only upload if photo is a new Data URI ---
    if (vehicleData.photo && typeof vehicleData.photo === 'string' && vehicleData.photo.startsWith('data:image')) {
        try {
            const newPhotoUrl = await uploadImageFromDataUri(vehicleData.photo, 'vehicles', `vehicle-${vehicleData.id}`);
            vehicleToUpsert.photo = newPhotoUrl;
        } catch (uploadError) {
            console.error("Vehicle image upload failed:", uploadError);
            return { data: null, error: { message: (uploadError as Error).message } };
        }
    }
    
    const { data, error } = await supabase
        .from('vehicles')
        .upsert(vehicleToUpsert, { onConflict: 'id' })
        .select()
        .single();
    
    if (error) {
        console.error('Error upserting vehicle:', error);
        return { data: null, error };
    }

    revalidatePath(`/${adminPath}/armada`);
    revalidatePath('/');
    
    return { data, error: null };
}

export async function deleteVehicle(vehicleId: string) {
    const supabase = createServiceRoleClient();
    
    const { data: itemData, error: fetchError } = await supabase.from('vehicles').select('photo').eq('id', vehicleId).single();
    if (fetchError) {
        console.error("Error fetching vehicle for deletion:", fetchError);
        return { error: fetchError };
    }
    
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
    
    if (error) {
        console.error('Error deleting vehicle:', error);
        return { error };
    }

    if(itemData.photo) {
        try {
            const bucketName = 'mudakarya-bucket';
            const urlParts = itemData.photo.split('/');
            const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
            await supabase.storage.from(bucketName).remove([filePath]);
        } catch (storageError) {
            console.error("Error deleting from storage, but continuing:", storageError);
        }
    }

    revalidatePath(`/${adminPath}/armada`);
    revalidatePath('/');

    return { error: null };
}

export async function updateVehicleStatus(vehicleId: string, status: 'tersedia' | 'dipesan' | 'disewa') {
    const supabase = createServiceRoleClient();

    const { error } = await supabase
        .from('vehicles')
        .update({ status })
        .eq('id', vehicleId);
    
    if (error) {
        console.error('Error updating vehicle status:', error);
        return { error };
    }

    revalidatePath(`/${adminPath}/armada`);
    revalidatePath(`/${adminPath}/orders`);

    return { error: null };
}
