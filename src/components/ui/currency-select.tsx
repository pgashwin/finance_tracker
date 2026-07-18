import { Select } from '@/components/ui/select';
import { SUPPORTED_CURRENCIES } from '@/constants/currencies';
import type { CurrencyCode } from '@/types';

interface CurrencySelectProps {
  value: CurrencyCode;
  onChange: (currency: CurrencyCode) => void;
  id?: string;
  className?: string;
}

export function CurrencySelect({ value, onChange, id, className }: CurrencySelectProps) {
  return (
    <Select
      id={id}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value as CurrencyCode)}
    >
      {SUPPORTED_CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {currency.label}
        </option>
      ))}
    </Select>
  );
}
