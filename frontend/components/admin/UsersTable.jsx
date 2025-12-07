import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Edit } from 'lucide-react';

export function UsersTable({
  users,
  searchTerm,
  setSearchTerm,
  formatDate,
  handleChangeRole,
  handleDeleteUser,
}) {
  return (
    <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <CardTitle className="text-slate-50">All Users <span className="text-slate-500 text-lg ml-2">{users.length}</span></CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-900/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus:ring-blue-900/50 focus:border-blue-700"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-slate-800">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-900/50 text-slate-400 font-medium">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-center">Events Created</th>
                <th className="p-4 text-center">Events Attended</th>
                <th className="p-4">Joined</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="hover:bg-slate-900/50 transition-colors">
                  <td className="p-4 font-medium text-slate-200">{u.name}</td>
                  <td className="p-4 text-slate-400">{u.email}</td>
                  <td className="p-4">
                    <Badge
                      className={
                        u.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 border-purple-500/20'
                          : u.role === 'organizer'
                          ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 border-blue-500/20'
                      }
                      variant="outline">
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-4 text-center text-slate-400">{u.events_created}</td>
                  <td className="p-4 text-center text-slate-400">{u.events_attended}</td>
                  <td className="p-4 text-slate-400">{formatDate(u.createdAt)}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => handleChangeRole(u.id, u.role)}
                        title="Change Role">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
