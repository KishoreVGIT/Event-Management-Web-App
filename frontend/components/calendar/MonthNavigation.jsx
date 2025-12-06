import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function MonthNavigation({
  monthName,
  onPrev,
  onNext,
  onToday,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h2 className="text-slate-50 text-lg font-semibold">{monthName}</h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onToday}
          size="sm"
          className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full">
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full w-9 h-9 p-0">
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          className="border-slate-700 text-slate-300 bg-slate-950/70 hover:bg-slate-900 hover:border-slate-600 hover:text-slate-100 rounded-full w-9 h-9 p-0">
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
