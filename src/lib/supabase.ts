
"use client";

import { createClient } from '@supabase/supabase-js'

// Ambil variabel lingkungan
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Fungsi untuk membuat klien Supabase dengan aman
const createSupabaseClient = () => {
    // Lakukan pengecekan untuk memastikan variabel lingkungan ada
    if (!supabaseUrl || !supabaseAnonKey) {
        // console.warn('Supabase URL and/or Anon Key are not set on the client. Supabase client will not be initialized.');
        // Kembalikan objek dummy atau null untuk mencegah crash saat build
        // di mana environment variables mungkin tidak tersedia.
        return null;
    }
    return createClient(supabaseUrl, supabaseAnonKey);
}

// Buat dan ekspor klien Supabase
// Jika null, setiap upaya untuk menggunakannya akan gagal saat runtime (jika dipanggil),
// tetapi tidak akan menghentikan proses build.
export const supabase = createSupabaseClient()!;
