import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function EventsByCategory({ eventsByCategory }) {
  if (!eventsByCategory || eventsByCategory.length === 0) return null;

  return (
    <div className="mb-8">
      <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl pt-6">
        <CardHeader>
          <CardTitle className="text-slate-50">Events by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {eventsByCategory.map((item) => (
              <div
                key={item.category}
                className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-center hover:bg-slate-800/50 transition-colors">
                <div className="text-2xl font-bold text-white mb-1">
                  {item.count}
                </div>
                <div className="text-sm text-slate-400">
                  {item.category}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
