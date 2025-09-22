
'use server';

import { createServiceRoleClient, uploadImageFromDataUri } from '@/utils/supabase/server';
import type { Promotion, Vehicle, Testimonial, GalleryItem, FeatureItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { type VehicleFormData } from './armada/actions';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';


// --- Promotion Actions ---

export async function upsertPromotion(promoData: Omit<Promotion, 'created_at'>, vehicles: Vehicle[], discount?: number) {
    const supabase = createServiceRoleClient();
    
    try {
        if (promoData.imageUrl && promoData.imageUrl.startsWith('data:image')) {
            promoData.imageUrl = await uploadImageFromDataUri(promoData.imageUrl, 'promotions', `promo-${promoData.id}`);
        }
    } catch (uploadError) {
        console.error("Promotion image upload failed:", uploadError);
        return { data: null, error: { message: (uploadError as Error).message } };
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
            // This is tricky because we need the full vehicle data, which might not be available here.
            // A better approach might be to just update the discount field.
             const { error: vehicleUpdateError } = await supabase
                .from('vehicles')
                .update({ discountPercentage: discount || null })
                .eq('id', vehicleToUpdate.id);
            if (vehicleUpdateError) {
                 console.error('Error updating vehicle discount:', vehicleUpdateError);
                 // We might want to handle this, but for now we'll let the promo be created
            }
        }
    }

    revalidatePath(`${adminPath}/promosi`);
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
        const bucketName = 'mudakarya-bucket';
        const filePath = itemData.imageUrl.substring(itemData.imageUrl.indexOf(bucketName) + bucketName.length + 1);
        await supabase.storage.from(bucketName).remove([filePath]);
    }
    
    // Also remove discount from vehicle if it was linked
    if (promo.vehicleId) {
        const vehicleToUpdate = vehicles.find(v => v.id === promo.vehicleId);
        if(vehicleToUpdate) {
            const { error: vehicleUpdateError } = await supabase
                .from('vehicles')
                .update({ discountPercentage: null })
                .eq('id', vehicleToUpdate.id);
            if (vehicleUpdateError) {
                 console.error('Error removing vehicle discount:', vehicleUpdateError);
            }
        }
    }

    revalidatePath(`${adminPath}/promosi`);
    revalidatePath('/'); // Revalidate home page
    return { error: null };
}

// --- Testimonial Actions ---

export async function upsertTestimonial(testimonialData: Omit<Testimonial, 'created_at'>) {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('testimonials').upsert(testimonialData, { onConflict: 'id' }).select().single();
    if (error) {
        console.error('Error upserting testimonial:', error);
        return { data: null, error };
    }
    revalidatePath(`${adminPath}/testimoni`);
    revalidatePath('/testimoni');
    if (data.vehicleName) {
        revalidatePath('/mobil');
    }
    return { data, error: null };
}


export async function deleteTestimonial(id: string) {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) return { error };
    revalidatePath(`${adminPath}/testimoni`);
    revalidatePath('/testimoni');
    revalidatePath('/mobil');
    return { error: null };
}

// --- Gallery Actions ---

export async function addGalleryItem(galleryData: Omit<GalleryItem, 'id' | 'created_at'>) {
    const supabase = createServiceRoleClient();

    try {
        if (galleryData.url && galleryData.url.startsWith('data:image')) {
            galleryData.url = await uploadImageFromDataUri(galleryData.url, 'gallery', `gallery-photo`);
        }
    } catch (uploadError) {
        console.error("Gallery image upload failed:", uploadError);
        return { data: null, error: { message: (uploadError as Error).message } };
    }

    const { data, error } = await supabase.from('gallery').insert(galleryData).select().single();
    if (error) {
        console.error('Error adding gallery item:', error);
        return { data: null, error };
    }
    revalidatePath(`${adminPath}/testimoni`);
    revalidatePath('/testimoni');
    revalidatePath('/mobil');
    return { data, error: null };
}

export async function deleteGalleryItem(id: string) {
    const supabase = createServiceRoleClient();
    // First, get the path of the object to delete from storage
    const { data: itemData, error: fetchError } = await supabase.from('gallery').select('url').eq('id', id).single();
    
    if (fetchError) {
        console.error("Error fetching gallery item for deletion:", fetchError);
        return { error: fetchError };
    }

    // Delete from DB
    const { error: deleteDbError } = await supabase.from('gallery').delete().eq('id', id);
    if (deleteDbError) {
        console.error("Error deleting gallery item from DB:", deleteDbError);
        return { error: deleteDbError };
    }

    // If DB deletion is successful, delete from storage
    if(itemData?.url) {
        const bucketName = 'mudakarya-bucket';
        const filePath = itemData.url.substring(itemData.url.indexOf(bucketName) + bucketName.length + 1);
        const { error: deleteStorageError } = await supabase.storage.from(bucketName).remove([filePath]);

        if (deleteStorageError) {
            console.error("Error deleting gallery item from Storage:", deleteStorageError);
            // We don't return an error here because the DB record is already gone, which is the main goal.
        }
    }


    revalidatePath(`${adminPath}/testimoni`);
    revalidatePath('/testimoni');
    revalidatePath('/mobil');
    return { error: null };
}


// --- Feature Actions ---

export async function upsertFeature(featureData: Omit<FeatureItem, 'created_at'>) {
    const supabase = createServiceRoleClient();

    try {
        if (featureData.imageUrl && featureData.imageUrl.startsWith('data:image')) {
             featureData.imageUrl = await uploadImageFromDataUri(featureData.imageUrl, 'features', `feature-${featureData.id}`);
        }
    } catch (uploadError) {
        console.error("Feature image upload failed:", uploadError);
        return { data: null, error: { message: (uploadError as Error).message } };
    }

    const { data, error } = await supabase.from('features').upsert(featureData, { onConflict: 'id' }).select().single();
    if (error) {
        console.error('Error upserting feature:', error);
        return { data: null, error };
    }
    revalidatePath(`${adminPath}/testimoni`);
    revalidatePath('/'); // Revalidate home page where features are shown
    return { data, error: null };
}

export async function deleteFeature(id: string) {
    const supabase = createServiceRoleClient();

    const { data: itemData, error: fetchError } = await supabase.from('features').select('imageUrl').eq('id', id).single();
    if (fetchError) {
        console.error("Error fetching feature for deletion:", fetchError);
        return { error: fetchError };
    }

    const { error } = await supabase.from('features').delete().eq('id', id);
    if (error) return { error };

    if(itemData.imageUrl) {
        const bucketName = 'mudakarya-bucket';
        const filePath = itemData.imageUrl.substring(itemData.imageUrl.indexOf(bucketName) + bucketName.length + 1);
        await supabase.storage.from(bucketName).remove([filePath]);
    }

    revalidatePath(`${adminPath}/testimoni`);
    revalidatePath('/'); // Revalidate home page
    return { error: null };
}
