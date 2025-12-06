import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function UsersByRole({ usersByRole }) {
  if (!usersByRole) return null;

  return (
    <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
      <CardHeader>
        <CardTitle className="text-slate-50">Users by Role</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {usersByRole.map((item) => (
            <div
              key={item.role}
              className="flex justify-between items-center p-3 bg-slate-900/50 border border-slate-800 rounded-lg backdrop-blur-sm">
              <span className="capitalize font-medium text-slate-200">{item.role}</span>
              <span className="text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded text-xs">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
