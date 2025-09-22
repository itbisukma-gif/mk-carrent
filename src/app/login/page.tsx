
'use client';

import { Suspense } from "react";
import LoginPageContent from "./content";

export default function LoginPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoginPageContent />
        </Suspense>
    )
}
