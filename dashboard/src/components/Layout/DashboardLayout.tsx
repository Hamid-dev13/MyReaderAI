import Navbar from './Navbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto py-6 px-4">
                {children}
            </main>
            <footer className="bg-white border-t py-4">
                <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
                    © 2024 Raedificare - Plateforme de suivi V3
                </div>
            </footer>
        </div>
    );
} 