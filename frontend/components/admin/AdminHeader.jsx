import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AdminHeader({ title }) {
  return (
    <nav className="bg-white dark:bg-gray-800 shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/admin/dashboard">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white cursor-pointer">
                {title}
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
