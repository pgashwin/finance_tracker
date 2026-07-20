import { cn } from '@/lib/utils';

export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClass: Record<IconSize, string> = {
  xs: 'text-[16px]',
  sm: 'text-[18px]',
  md: 'text-[20px]',
  lg: 'text-[24px]',
  xl: 'text-[28px]',
};

export interface IconProps {
  /** Material Symbols icon name — https://fonts.google.com/icons */
  name: string;
  className?: string;
  size?: IconSize;
  filled?: boolean;
  /** Spin animation (e.g. progress_activity) */
  spin?: boolean;
  'aria-hidden'?: boolean;
  'aria-label'?: string;
}

export function Icon({
  name,
  className,
  size = 'md',
  filled = false,
  spin = false,
  ...props
}: IconProps) {
  return (
    <span
      className={cn(
        'material-symbols-rounded inline-flex shrink-0 leading-none',
        sizeClass[size],
        filled && 'material-symbols-filled',
        spin && 'animate-spin-slow',
        className,
      )}
      aria-hidden={props['aria-label'] ? undefined : (props['aria-hidden'] ?? true)}
      aria-label={props['aria-label']}
      role={props['aria-label'] ? 'img' : undefined}
    >
      {name}
    </span>
  );
}
