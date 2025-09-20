
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Testimonial, GalleryItem, FeatureItem } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set(name: string, value: string, options: CookieOptions) {
          try { cookieStore.set({ name, value, ...options }) } catch (error) {}
        },
        remove(name: string, options: CookieOptions) {
          try { cookieStore.set({ name, value: '', ...options }) } catch (error) {}
        },
      },
    }
  )
}

// --- Testimonial Actions ---

export async function upsertTestimonial(testimonialData: Omit<Testimonial, 'created_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase.from('testimonials').upsert(testimonialData, { onConflict: 'id' }).select().single();
    if (error) return { data: null, error };
    revalidatePath('/dashboard/testimoni');
    revalidatePath('/testimoni');
    return { data, error: null };
}

export async function deleteTestimonial(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) return { error };
    revalidatePath('/dashboard/testimoni');
    revalidatePath('/testimoni');
    return { error: null };
}

// --- Gallery Actions ---

export async function addGalleryItem(galleryData: Omit<GalleryItem, 'id' | 'created_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase.from('gallery').insert(galleryData).select().single();
    if (error) return { data: null, error };
    revalidatePath('/dashboard/testimoni');
    revalidatePath('/testimoni');
    return { data, error: null };
}

export async function deleteGalleryItem(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) return { error };
    revalidatePath('/dashboard/testimoni');
    revalidatePath('/testimoni');
    return { error: null };
}


// --- Feature Actions ---

export async function upsertFeature(featureData: Omit<FeatureItem, 'created_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase.from('features').upsert(featureData, { onConflict: 'id' }).select().single();
    if (error) return { data: null, error };
    revalidatePath('/dashboard/testimoni');
    revalidatePath('/'); // Revalidate home page where features are shown
    return { data, error: null };
}

export async function deleteFeature(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('features').delete().eq('id', id);
    if (error) return { error };
    revalidatePath('/dashboard/testimoni');
    revalidatePath('/'); // Revalidate home page
    return { error: null };
}
