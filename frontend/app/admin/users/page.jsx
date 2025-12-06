'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { API_URL } from '@/lib/constants';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { UsersTable } from '@/components/admin/UsersTable';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, getToken, loading: authLoading } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/signin');
      } else if (user.role !== 'admin') {
        alert('Admin access required');
        router.push('/');
      } else {
        fetchUsers();
      }
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !confirm(
        `Are you sure you want to delete ${userName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId));
        alert('User deleted successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = prompt(
      `Change role for user (current: ${currentRole})\nEnter: student, organizer, or admin`,
      currentRole
    );

    if (!newRole || newRole === currentRole) return;

    if (!['student', 'organizer', 'admin'].includes(newRole)) {
      alert('Invalid role');
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(
        `${API_URL}/api/admin/users/${userId}/role`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        fetchUsers();
        alert('Role updated successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AdminHeader title="Campus Connect - User Management" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UsersTable
          users={filteredUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          formatDate={formatDate}
          handleChangeRole={handleChangeRole}
          handleDeleteUser={handleDeleteUser}
        />
      </main>
    </div>
  );
}

