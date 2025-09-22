'use server';

import { createClient } from '@/utils/supabase/server';
import type { ContactInfo, TermsContent } from "@/lib/types";
import { revalidatePath } from 'next/cache';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || 'admin';

export async function updateContactInfo(data: ContactInfo) {
    const supabase = createClient();
    // Create a new object to avoid mutating the original
    const updateData = { ...data };
    // Remove id because it's not a column we want to update
    delete updateData.id;

    const { error } = await supabase.from('contact_info').update(updateData).eq('id', 1);
    if (!error) {
        revalidatePath('/kontak');
        revalidatePath(`/${adminPath}/pengaturan`);
    }
    return { error };
}

export async function updateTermsContent(data: TermsContent) {
    const supabase = createClient();
    // Create a new object to avoid mutating the original
    const updateData = { ...data };
    // Remove id because it's not a column we want to update
    delete updateData.id;

    const { error } = await supabase.from('terms_content').update(updateData).eq('id', 1);
    if (!error) {
        revalidatePath('/syarat-ketentuan');
        revalidatePath(`/${adminPath}/pengaturan`);
    }
    return { error };
}
