import { useAuth } from '@/contexts/AuthContext';
import { CURRENCIES } from '@/lib/types';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
}

export function CurrencyDisplay({ amount, className }: CurrencyDisplayProps) {
  const { userSettings } = useAuth();
  
  const currency = CURRENCIES.find(c => c.code === userSettings?.currency) || CURRENCIES[0];
  
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return (
    <span className={className}>
      {currency.symbol} {formattedAmount}
    </span>
  );
}

export function useCurrency() {
  const { userSettings } = useAuth();
  const currency = CURRENCIES.find(c => c.code === userSettings?.currency) || CURRENCIES[0];
  
  const formatAmount = (amount: number): string => {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${currency.symbol} ${formattedAmount}`;
  };

  return { currency, formatAmount };
}
