import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export function BenefitsSection() {
  return (
    <div className="hidden md:block">
      <div className="sticky top-8 space-y-6">
        <Card className="bg-slate-950/70 border-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl shadow-blue-900/20">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-50 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-blue-400" />
              Why join Campus Connect?
            </h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-blue-400" />
                </div>
                <span>Discover campus events instantly</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>
                <span>Easy RSVP and notifications</span>
              </li>
              <li className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
                <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-purple-400" />
                </div>
                <span>Connect with your community</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 backdrop-blur-sm">
          <p className="text-xs text-center text-slate-400">
            Join 5000+ active students already using Campus Connect
          </p>
        </div>
      </div>
    </div>
  );
}
