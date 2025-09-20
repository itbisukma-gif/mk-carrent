
import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // This will only throw on the client-side, which is fine.
    // The build process won't be affected.
    throw new Error("Supabase URL and Anon Key are required on the client side.");
  }
  
  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  );
}
