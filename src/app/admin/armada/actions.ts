
'use server';

import { createServiceRoleClient } from '@/utils/supabase/server';
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const adminPath = '/admin';

export async function upsertVehicle(vehicleData: Vehicle) {
    const supabase = createServiceRoleClient();

    try {
        // Only upload a new image if the photo is a new data URI
        if (vehicleData.photo && vehicleData.photo.startsWith('data:image')) {
            const matches = vehicleData.photo.match(/^data:(image\/(?:png|jpeg|jpg));base64,(.*)$/);
            if (!matches) throw new Error('Invalid image data URI');
            
            const mimeType = matches[1];
            const base64Data = matches[2];
            const fileExtension = mimeType.split('/')[1];
            const buffer = Buffer.from(base64Data, 'base64');
            const fileName = `vehicle-${vehicleData.id}-${Date.now()}.${fileExtension}`;
            const filePath = `vehicles/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('mudakarya-bucket')
                .upload(filePath, buffer, { contentType: mimeType, upsert: true });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from('mudakarya-bucket').getPublicUrl(filePath);
            vehicleData.photo = publicUrlData.publicUrl;
        }
    } catch (uploadError) {
        console.error("Vehicle image upload failed:", uploadError);
        return { data: null, error: { message: (uploadError as Error).message } };
    }

    const { data, error } = await supabase
        .from('vehicles')
        .upsert(vehicleData, { onConflict: 'id' })
        .select()
        .single();
    
    if (error) {
        console.error('Error upserting vehicle:', error);
        return { data: null, error };
    }

    revalidatePath(`${adminPath}/armada`);
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
            if(filePath) await supabase.storage.from(bucketName).remove([filePath]);
        } catch(e) {
            console.error("Error deleting old photo from storage:", e)
        }
    }

    revalidatePath(`${adminPath}/armada`);
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

    revalidatePath(`${adminPath}/armada`);
    revalidatePath(`${adminPath}/orders`);

    return { error: null };
}
