
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Vehicle } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// This is a helper function to create a Supabase client that can be used in Server Components and Server Actions.
// It reads the Supabase URL and anon key from environment variables and the session cookie from the request.
const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

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
