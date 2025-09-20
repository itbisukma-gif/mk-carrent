
'use server';

import { createClient } from '@/utils/supabase/server';
import type { Promotion } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function upsertPromotion(promoData: Omit<Promotion, 'created_at'>) {
    const supabase = createClient();
    const { data, error } = await supabase.from('promotions').upsert(promoData, { onConflict: 'id' }).select().single();
    if (error) {
        console.error('Error upserting promotion:', error);
        return { data: null, error };
    }
    revalidatePath('/dashboard/promosi');
    revalidatePath('/'); // Revalidate home page where promotions are shown
    return { data, error: null };
}

export async function deletePromotion(promoId: string) {
    const supabase = createClient();
    const { error } = await supabase.from('promotions').delete().eq('id', promoId);
    if (error) {
        console.error('Error deleting promotion:', error);
        return { error };
    }
    revalidatePath('/dashboard/promosi');
    revalidatePath('/'); // Revalidate home page
    return { error: null };
}
