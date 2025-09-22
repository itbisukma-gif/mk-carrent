'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { BarChart, Car, Users, Settings, MessageSquare, LogOut, FileText, ShoppingCart, DollarSign } from 'lucide-react';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart },
  { href: '/dashboard/pesanan', label: 'Pesanan', icon: ShoppingCart },
  { href: '/dashboard/pembayaran', label: 'Pembayaran', icon: DollarSign },
  { href: '/dashboard/mobil', label: 'Mobil', icon: Car },
  { href: '/dashboard/pelanggan', label: 'Pelanggan', icon: Users },
  { href: '/dashboard/laporan', label: 'Laporan', icon: FileText },
  { href: '/dashboard/testimoni', label: 'Testimoni', icon: MessageSquare },
  { href: '/dashboard/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 h-screen px-4 py-8 overflow-y-auto bg-white border-r rtl:border-r-0 rtl:border-l dark:bg-gray-900 dark:border-gray-700">
      <Link href="/dashboard" className="flex items-center space-x-2 rtl:space-x-reverse">
        <Image src="/logo-icon.png" alt="MudaKarya RentCar Logo" width={40} height={40} />
        <span className="text-xl font-bold">MudaKarya RentCar</span>
      </Link>

      <div className="flex flex-col justify-between flex-1 mt-6">
        <nav>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center px-4 py-2 mt-5 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700 ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}>
                <Icon className="w-5 h-5" />
                <span className="mx-4 font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4">
            <Link href="/" className="flex items-center px-4 py-2 text-gray-600 transition-colors duration-300 transform rounded-lg dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 hover:text-gray-700">
                <LogOut className="w-5 h-5" />
                <span className="mx-4 font-medium">Logout</span>
            </Link>
        </div>

      </div>
    </aside>
  );
}
