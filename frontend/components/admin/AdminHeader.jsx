import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export function AdminHeader({ title }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const isActive = (path) => pathname === path;

  return (
    <nav className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-0">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-1">
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  className={`text-slate-300 hover:text-white hover:bg-slate-800 ${
                    isActive('/admin/dashboard') ? 'bg-slate-800 text-white' : ''
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Overview
                </Button>
              </Link>
              <Link href="/admin/users">
                <Button
                  variant="ghost"
                  className={`text-slate-300 hover:text-white hover:bg-slate-800 ${
                    isActive('/admin/users') ? 'bg-slate-800 text-white' : ''
                  }`}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </Button>
              </Link>
              <Link href="/admin/events">
                <Button
                  variant="ghost"
                  className={`text-slate-300 hover:text-white hover:bg-slate-800 ${
                    isActive('/admin/events') ? 'bg-slate-800 text-white' : ''
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Events
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <Link href="/events">
               <Button>
                 View Site
               </Button>
             </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
