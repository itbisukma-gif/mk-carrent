
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@example.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "password";
const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            // Set session cookie
            cookies().set('session', 'admin_logged_in', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: '/',
            });

            const redirectTo = req.nextUrl.searchParams.get('redirect_to') || ADMIN_PATH;
            
            return NextResponse.json({ success: true, message: 'Login berhasil', redirectTo });

        } else {
            return NextResponse.json({ success: false, message: 'Email atau password salah' }, { status: 401 });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Terjadi kesalahan pada server' }, { status: 500 });
    }
}
