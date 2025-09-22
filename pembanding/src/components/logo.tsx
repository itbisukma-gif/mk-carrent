import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ width, height, className }: { width: number; height: number; className?: string }) {
  return (
    <Image
      src="/logo-icon.png"
      alt="MudaKarya CarRent Logo"
      width={width}
      height={height}
      className={cn("dark:invert", className)} 
      priority
    />
  );
}
