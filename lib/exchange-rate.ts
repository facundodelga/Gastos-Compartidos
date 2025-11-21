import { ExchangeRateResponse } from '@/types';

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

interface CachedRates {
  rates: { [key: string]: number };
  timestamp: number;
}

export async function getExchangeRate(from: string, to: string): Promise<number> {
  const normalizedFrom = from.toUpperCase();
  const normalizedTo = to.toUpperCase();

  if (normalizedFrom === normalizedTo) return 1;

  try {
    // Check cache first (client-side only)
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { rates, timestamp }: CachedRates = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          const rate = rates[`${normalizedFrom}_${normalizedTo}`];
          if (rate) return rate;
        }
      }
    }

    // Fetch from API
    const response = await fetch(
      `https://open.er-api.com/v6/latest/${normalizedFrom}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate');
    }

    const data: ExchangeRateResponse = await response.json();
    
    if (data.result !== 'success' || !data.rates?.[normalizedTo]) {
      throw new Error('Invalid exchange rate response');
    }

    const rate = data.rates[normalizedTo];

    // Update cache (client-side only)
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      const cachedData: CachedRates = cached 
        ? JSON.parse(cached) 
        : { rates: {}, timestamp: Date.now() };
      
      cachedData.rates[`${normalizedFrom}_${normalizedTo}`] = rate;
      cachedData.timestamp = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
    }

    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 1; // Fallback to 1:1 rate
  }
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  const rate = await getExchangeRate(from, to);
  return amount * rate;
}
