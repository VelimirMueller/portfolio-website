import { Rocket } from 'lucide-react';
import { Card } from '../ui';

/**
 * The "Vercel" KPI tab, for now a placeholder: deployments and build status
 * need a read-only Vercel API token in the environment first. No Vercel API
 * is called from here.
 */
export function VercelPanel() {
  return (
    <Card className="max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-brand-500/15 text-brand-400 shrink-0">
          <Rocket size={18} aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">Vercel — coming soon</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            This tab will list the project&apos;s deployments with their build status, so a release can be
            checked next to the site KPIs. It needs a read-only Vercel token first: set{' '}
            <code className="font-mono text-xs text-brand-400">VERCEL_API_TOKEN</code> in the environment.
            Until then no Vercel API is called.
          </p>
        </div>
      </div>
    </Card>
  );
}
