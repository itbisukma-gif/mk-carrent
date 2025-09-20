
import { createBrowserClient } from "@supabase/ssr";

// Perubahan Penting: Kita tidak lagi mengekspor 'const supabase'.
// Kita mengekspor fungsi 'createClient' untuk inisialisasi yang "malas" (lazy initialization).
export const createClient = () => {
  // Variabel env akan dibaca di sisi klien (browser), bukan saat build.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Di lingkungan klien, ini seharusnya tidak pernah terjadi jika env di-set dengan benar.
    // Namun, ini adalah pengaman.
    console.error("Supabase URL and Anon Key are required on the client side.");
    // Mengembalikan null atau client dummy untuk mencegah aplikasi crash total.
    // Dalam kasus ini, kita biarkan createBrowserClient yang melempar error jika memang kosong saat runtime.
  }
  
  return createBrowserClient(
    supabaseUrl!,
    supabaseKey!
  );
}
