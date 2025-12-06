import { Button } from '@/components/ui/button';

export function EventsFilters({ filterStatus, onFilterChange, eventStats }) {
  const filters = [
    { value: 'all', label: 'All Events', count: eventStats.all },
    { value: 'upcoming', label: 'Upcoming', count: eventStats.upcoming },
    { value: 'ongoing', label: 'Ongoing', count: eventStats.ongoing },
    { value: 'past', label: 'Past', count: eventStats.past },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
            filterStatus === filter.value
              ? 'bg-blue-600 text-white ring-2 ring-blue-500/60 shadow-lg shadow-blue-500/30'
              : 'bg-slate-950/70 text-slate-300 border border-slate-800/70 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-100'
          }`}>
          {filter.label}{' '}
          <span className={filterStatus === filter.value ? 'opacity-90' : 'opacity-60'}>
            ({filter.count})
          </span>
        </button>
      ))}
    </div>
  );
}
