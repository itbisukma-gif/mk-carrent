'use server';

import { createServiceRoleClient, uploadImageFromDataUri } from '@/utils/supabase/server';
import type { Testimonial, GalleryItem, FeatureItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';

export async function upsertTestimonial(testimonialData: Omit<Testimonial, 'created_at'>) {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase.from('testimonials').upsert(testimonialData, { onConflict: 'id' }).select().single();
    if (error) {
        console.error('Error upserting testimonial:', error);
        return { data: null, error };
    }
    revalidatePath(`/${adminPath}/testimoni`);
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
    revalidatePath(`/${adminPath}/testimoni`);
    revalidatePath('/testimoni');
    revalidatePath('/mobil');
    return { error: null };
}

export async function addGalleryItem(galleryData: Omit<GalleryItem, 'id' | 'created_at'>) {
    const supabase = createServiceRoleClient();

    try {
        if (galleryData.url && galleryData.url.startsWith('data:image')) {
            galleryData.url = await uploadImageFromDataUri(galleryData.url, 'gallery', `gallery-photo-${Date.now()}`);
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
    revalidatePath(`/${adminPath}/testimoni`);
    revalidatePath('/testimoni');
    revalidatePath('/mobil');
    return { data, error: null };
}

export async function deleteGalleryItem(id: string) {
    const supabase = createServiceRoleClient();
    
    const { data: itemData, error: fetchError } = await supabase.from('gallery').select('url').eq('id', id).single();
    if (fetchError) {
        console.error("Error fetching gallery item for deletion:", fetchError);
        return { error: fetchError };
    }

    const { error: deleteDbError } = await supabase.from('gallery').delete().eq('id', id);
    if (deleteDbError) {
        console.error("Error deleting gallery item from DB:", deleteDbError);
        return { error: deleteDbError };
    }

    if(itemData?.url) {
        try {
            const bucketName = 'mudakarya-bucket';
            const urlParts = itemData.url.split('/');
            const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
            await supabase.storage.from(bucketName).remove([filePath]);
        } catch (storageError) {
            console.error("Error deleting from storage, but continuing:", storageError);
        }
    }

    revalidatePath(`/${adminPath}/testimoni`);
    revalidatePath('/testimoni');
    revalidatePath('/mobil');
    return { error: null };
}

export async function upsertFeature(featureData: Omit<FeatureItem, 'created_at'>) {
    const supabase = createServiceRoleClient();

    if (featureData.imageUrl && featureData.imageUrl.startsWith('data:image')) {
        try {
             featureData.imageUrl = await uploadImageFromDataUri(featureData.imageUrl, 'features', `feature-${featureData.id}`);
        } catch (uploadError) {
            console.error("Feature image upload failed:", uploadError);
            return { data: null, error: { message: (uploadError as Error).message } };
        }
    }

    const { data, error } = await supabase.from('features').upsert(featureData, { onConflict: 'id' }).select().single();
    if (error) {
        console.error('Error upserting feature:', error);
        return { data: null, error };
    }
    revalidatePath(`/${adminPath}/testimoni`);
    revalidatePath('/');
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
        try {
            const bucketName = 'mudakarya-bucket';
            const urlParts = itemData.imageUrl.split('/');
            const filePath = urlParts.slice(urlParts.indexOf(bucketName) + 1).join('/');
            await supabase.storage.from(bucketName).remove([filePath]);
        } catch (storageError) {
            console.error("Error deleting from storage, but continuing:", storageError);
        }
    }

    revalidatePath(`/${adminPath}/testimoni`);
    revalidatePath('/');
    return { error: null };
}
