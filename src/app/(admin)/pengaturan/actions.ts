
'use server';

import { createServiceRoleClient } from '@/utils/supabase/server';
import type { ContactInfo, TermsContent } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/dashboard';

export async function updateContactInfo(data: Partial<ContactInfo>) {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('contact_info').update(data).eq('id', 1);
    
    if (!error) {
        revalidatePath(`${adminPath}/pengaturan`);
    }
    
    return { error };
}

export async function updateTermsContent(data: TermsContent) {
    const supabase = createServiceRoleClient();
    const { error } = await supabase.from('terms_content').update(data).eq('id', 1);
    
    if (!error) {
        revalidatePath(`${adminPath}/pengaturan`);
    }

    return { error };
}
