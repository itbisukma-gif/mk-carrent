
import { redirect } from 'next/navigation';

export default function TestimoniRedirectPage() {
    // This page `/testimoni` is now an admin-only page.
    // The public-facing testimoni page is at `/(web)/testimoni`.
    // We redirect to the correct public page to avoid confusion.
    redirect('/testimoni');
}

    