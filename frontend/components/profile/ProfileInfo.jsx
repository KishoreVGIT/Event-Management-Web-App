import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';

export function ProfileInfo({
  profile,
  onUpdateProfile,
  formatDate,
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const [organizationName, setOrganizationName] = useState(
    profile.organization_name || ''
  );
  const [updating, setUpdating] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    await onUpdateProfile({
      name,
      organizationName,
    });
    setUpdating(false);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setName(profile.name);
    setOrganizationName(profile.organization_name || '');
  };

  return (
    <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl shadow-2xl shadow-blue-900/10 rounded-2xl pt-6">
      <CardHeader>
        <CardTitle className="text-slate-50">Profile Information</CardTitle>
        <CardDescription className="text-slate-400">
          Your account details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-300">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            {profile.role === 'organizer' && (
              <div>
                <Label
                  htmlFor="organizationName"
                  className="text-slate-300">
                  Organization Name{' '}
                  <span className="text-slate-500 font-normal">
                    (Optional)
                  </span>
                </Label>
                <Input
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder="e.g., Computer Science Club"
                  className="h-11 bg-slate-900/70 border-slate-800/70 text-slate-100 placeholder:text-slate-500 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-xs text-slate-400 mt-1">
                  This name will be displayed as the event organizer
                  instead of your personal name
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={updating}
                className="bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20">
                {updating ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={updating}
                className="bg-slate-800/70 text-slate-300 hover:bg-slate-800 border-slate-700 rounded-full">
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <>
            <div>
              <p className="text-sm font-medium text-slate-400">Name</p>
              <p className="text-lg text-slate-50 mt-1">{profile.name}</p>
            </div>
            {profile.role === 'organizer' && (
              <div>
                <p className="text-sm font-medium text-slate-400">
                  Organization Name
                </p>
                <p className="text-lg text-slate-50 mt-1">
                  {profile.organization_name || (
                    <span className="text-slate-500 italic">Not set</span>
                  )}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-slate-400">Email</p>
              <p className="text-lg text-slate-50 mt-1">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Role</p>
              <p className="text-lg text-slate-50 mt-1 capitalize">
                {profile.role}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">
                Member Since
              </p>
              <p className="text-lg text-slate-50 mt-1">
                {profile.createdAt
                  ? formatDate(profile.createdAt)
                  : '—'}
              </p>
            </div>
            <Button
              onClick={() => setEditing(true)}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20">
              Edit Profile
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
