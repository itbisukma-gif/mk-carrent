
'use server';

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Driver } from '@/lib/types';
import { revalidatePath } from 'next/cache';

// This is a helper function to create a Supabase client that can be used in Server Components and Server Actions.
const createClient = () => {
  const cookieStore = cookies()

  // Guard clause to prevent error during build process
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    // In a server action, we can't return null, so we throw a clear error.
    // This part of the code should ideally not be reached during a production request.
    // But for build time, we need a way to not crash.
    // Returning a dummy client or null won't work well with server actions.
    // The best approach is to check this at the start of each action.
    return null;
  }

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
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
          }
        },
      },
    }
  )
}

export async function upsertDriver(driverData: Omit<Driver, 'created_at'>) {
    const supabase = createClient();
    if (!supabase) {
        return { data: null, error: { message: 'Supabase credentials are not configured.' } };
    }

    const { data, error } = await supabase
        .from('drivers')
        .upsert(driverData, { onConflict: 'id' })
        .select()
        .single();
    
    if (error) {
        console.error('Error upserting driver:', error);
        return { data: null, error };
    }

    revalidatePath('/dashboard');
    
    return { data, error: null };
}


export async function deleteDriver(driverId: string) {
    const supabase = createClient();
    if (!supabase) {
        return { error: { message: 'Supabase credentials are not configured.' } };
    }
    
    const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);
    
    if (error) {
        console.error('Error deleting driver:', error);
        return { error };
    }

    revalidatePath('/dashboard');

    return { error: null };
}

export async function updateDriverStatus(driverId: string, status: 'Tersedia' | 'Bertugas') {
    const supabase = createClient();
    if (!supabase) {
        return { error: { message: 'Supabase credentials are not configured.' } };
    }

    const { error } = await supabase
        .from('drivers')
        .update({ status })
        .eq('id', driverId);

    if (error) {
        console.error('Error updating driver status:', error);
        return { error };
    }
    
    revalidatePath('/dashboard');
    revalidatePath('/dashboard/orders');

    return { error: null };
}
