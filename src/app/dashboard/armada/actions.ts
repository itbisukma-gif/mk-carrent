
'use server';

import { createClient } from '@/utils/supabase/server';
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function upsertVehicle(vehicleData: Vehicle) {
    const supabase = createClient();

    // If vehicleData has an id, it's an update. If not, it's an insert.
    // Supabase's upsert handles this. If id is provided and exists, it updates.
    // If id is not provided or doesn't exist, it inserts.
    const { data, error } = await supabase
        .from('vehicles')
        .upsert(vehicleData, { onConflict: 'id' })
        .select()
        .single();
    
    if (error) {
        console.error('Error upserting vehicle:', error);
        return { data: null, error };
    }

    revalidatePath('/dashboard/armada');
    revalidatePath('/'); // Also revalidate home page
    
    return { data, error: null };
}

export async function deleteVehicle(vehicleId: string) {
    const supabase = createClient();
    
    const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId);
    
    if (error) {
        console.error('Error deleting vehicle:', error);
        return { error };
    }

    revalidatePath('/dashboard/armada');
    revalidatePath('/'); // Also revalidate home page

    return { error: null };
}
