
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('password');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const adminPath = '/admin';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Gagal untuk masuk');
            }
            
            toast({
                title: "Login Berhasil",
                description: "Anda akan diarahkan ke dashboard.",
            });
            
            const redirectTo = searchParams.get('redirect_to') || adminPath;
            router.push(redirectTo);
            router.refresh();

        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Login Gagal",
                description: (error as Error).message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Masukkan email dan password Anda untuk masuk ke panel admin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleLogin} className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLoading ? 'Memproses...' : 'Masuk'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
