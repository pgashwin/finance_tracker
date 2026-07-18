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
    <Card className="border-0 bg-accent/60 md-elevation-1">
      <CardContent className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {stat.label}
            </p>
            <p
              className={cn(
                'mt-1 text-xl font-bold',
                stat.variant === 'positive' && 'text-success',
                stat.variant === 'negative' && 'text-destructive',
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
