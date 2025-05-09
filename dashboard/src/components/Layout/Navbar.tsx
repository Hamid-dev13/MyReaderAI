'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path ? 'bg-blue-700' : '';
    };

    return (
        <nav className="bg-blue-600 px-4 py-3 shadow-md">
            <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center">
                    <span className="text-white text-xl font-semibold">Raedificare</span>
                    <span className="ml-2 text-white/80 text-sm">Suivi V3</span>
                </div>

                <div className="flex space-x-1">
                    <Link
                        href="/dashboard"
                        className={`px-3 py-2 text-white rounded-md hover:bg-blue-700 transition-colors ${isActive('/dashboard')}`}
                    >
                        Tableau de bord
                    </Link>
                    <Link
                        href="/dashboard/documents"
                        className={`px-3 py-2 text-white rounded-md hover:bg-blue-700 transition-colors ${isActive('/dashboard/documents')}`}
                    >
                        Documents
                    </Link>
                </div>
            </div>
        </nav>
    );
} 