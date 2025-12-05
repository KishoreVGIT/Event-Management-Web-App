'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { Menu, X, Calendar, Home, User, LayoutDashboard, Users } from 'lucide-react';

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, signout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signout();
    setMobileMenuOpen(false);
    router.push('/signin');
  };

  const isActive = (path) => {
    return pathname === path;
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home, show: true },
    { href: '/events', label: 'Events', icon: Calendar, show: true },
    { href: '/events/calendar', label: 'Calendar', icon: Calendar, show: !!user },
    {
      href: user?.role === 'student' ? '/student/dashboard' : '/organizer/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: user && (user.role === 'student' || user.role === 'organizer')
    },
    { href: '/admin/dashboard', label: 'Admin', icon: Users, show: user?.role === 'admin' },
    { href: '/profile', label: 'Profile', icon: User, show: !!user },
  ].filter(link => link.show);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Campus Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-gray-700 dark:text-gray-300 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  {user.name}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/signin')}>
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/signup')}
                  className="bg-blue-600 hover:bg-blue-700">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}>
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-800 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    Signed in as <span className="font-semibold">{user.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-center hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-center"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/signin');
                    }}>
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/signup');
                    }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                Campus Connect
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
              Your one-stop platform for discovering, organizing, and attending campus events.
              Connect with your community and never miss out on what's happening around you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/events" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Browse Events
                </Link>
              </li>
              <li>
                <Link href="/events/calendar" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Event Calendar
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">About</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Purdue Fort Wayne
                </span>
              </li>
              <li>
                <span className="text-gray-600 dark:text-gray-400 text-sm">
                  Campus Events Platform
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
