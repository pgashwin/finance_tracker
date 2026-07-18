import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface BucketStat {
  label: string;
  value: string;
  sub?: string;
  variant?: 'default' | 'positive' | 'negative';
}

interface BucketTotalBarProps {
  stats: BucketStat[];
}

export function BucketTotalBar({ stats }: BucketTotalBarProps) {
  if (!stats.length) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-bold',
                stat.variant === 'positive' && 'text-green-600 dark:text-green-400',
                stat.variant === 'negative' && 'text-red-600 dark:text-red-400',
              )}
            >
              {stat.value}
            </p>
            {stat.sub && <p className="mt-0.5 text-xs text-muted-foreground">{stat.sub}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
