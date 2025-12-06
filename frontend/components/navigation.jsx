'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
  Menu,
  X,
  Calendar,
  Home,
  User,
  LayoutDashboard,
  Users,
  LogOut,
} from 'lucide-react';

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
    {
      href: '/events/calendar',
      label: 'Calendar',
      icon: Calendar,
      show: !!user,
    },
    {
      href:
        user?.role === 'student'
          ? '/student/dashboard'
          : '/organizer/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      show:
        user &&
        (user.role === 'student' || user.role === 'organizer'),
    },
    {
      href: '/admin/dashboard',
      label: 'Admin',
      icon: Users,
      show: user?.role === 'admin',
    },
    { href: '/profile', label: 'Profile', icon: User, show: !!user },
  ].filter((link) => link.show);

  return (
    <nav className="sticky top-0 z-50 bg-slate-950 border-b border-slate-800/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0 py-2">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/30">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-50">
              Campus Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                  }`}>
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {user ? (
              <>
                <span className="text-sm text-slate-300 px-4 py-2 bg-slate-900/70 border border-slate-800/70 rounded-full backdrop-blur-sm">
                  {user.name}
                </span>
                <Button
                  size="sm"
                  onClick={handleSignOut}
                  className="rounded-full hover:bg-red-700 text-white hover:border-red-500/60 transition-all bg-red-800 px-4">
                  Sign Out
                  <LogOut />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/signin')}
                  className="rounded-full text-slate-300 hover:bg-slate-800/70 hover:text-slate-100 px-6 py-1.5">
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => router.push('/signup')}
                  className="rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-105 px-6">
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-slate-800/70 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-300" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800/70 bg-slate-950/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-slate-100'
                  }`}>
                  <Icon className="w-5 h-5" />
                  {link.label}
                </Link>
              );
            })}

            <div className="pt-3 mt-3 border-t border-slate-800/70 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-3 text-sm text-slate-300 bg-slate-900/70 border border-slate-800/70 rounded-2xl backdrop-blur-sm">
                    Signed in as{' '}
                    <span className="font-semibold text-slate-100">
                      {user.name}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full justify-center rounded-full border-red-500/40 bg-red-500 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/60 text-white"
                    onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    className="w-full justify-center rounded-full border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      router.push('/signin');
                    }}>
                    Sign In
                  </Button>
                  <Button
                    className="w-full justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30"
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
    <footer className="relative bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800/70 mt-auto overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Campus Connect
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Your one-stop platform for discovering, organizing, and
              attending campus events. Connect with your community and
              never miss out on what's happening around you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-slate-50 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/events"
                  className="text-slate-400 hover:text-blue-400 text-sm transition-colors inline-flex items-center group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Browse Events
                </Link>
              </li>
              <li>
                <Link
                  href="/events/calendar"
                  className="text-slate-400 hover:text-blue-400 text-sm transition-colors inline-flex items-center group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Event Calendar
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-slate-400 hover:text-blue-400 text-sm transition-colors inline-flex items-center group">
                  <span className="w-1 h-1 bg-blue-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-semibold text-slate-50 mb-4">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <span className="text-slate-400 text-sm">
                  Purdue Fort Wayne
                </span>
              </li>
              <li>
                <span className="text-slate-400 text-sm">
                  Campus Events Platform
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/70">
          <p className="text-center text-sm text-slate-400">
            &copy; {new Date().getFullYear()} Campus Connect. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
