import { ExchangeRateResponse } from '@/types';

const CACHE_KEY = 'exchange_rates_cache';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds
const EXCHANGERATE_HOST_KEY =
  typeof process !== 'undefined'
    ? process.env.NEXT_PUBLIC_EXCHANGERATE_HOST_KEY
    : undefined;

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

    const rate = await fetchExchangeRate(normalizedFrom, normalizedTo);

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

async function fetchExchangeRate(
  base: string,
  target: string
): Promise<number> {
  try {
    const params = new URLSearchParams({
      base,
      symbols: target,
    });
    if (EXCHANGERATE_HOST_KEY) {
      params.set('access_key', EXCHANGERATE_HOST_KEY);
    }

    const response = await fetch(
      `https://api.exchangerate.host/latest?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate from exchangerate.host');
    }

    const data: ExchangeRateResponse = await response.json();

    // exchangerate.host devuelve success=false cuando falta access_key o hay otro problema
    if (data.success === false) {
      throw new Error(
        data?.rates?.[target]
          ? 'exchangerate.host reported success=false'
          : 'exchangerate.host error'
      );
    }

    const rate = data.rates?.[target];
    if (typeof rate !== 'number') {
      throw new Error('Rate not found in exchangerate.host response');
    }

    return rate;
  } catch (hostError) {
    console.warn(
      '[exchange-rate] Falling back to open.er-api.com:',
      hostError
    );

    // Fallback gratis para no romper la app si falta access_key en exchangerate.host
    const response = await fetch(`https://open.er-api.com/v6/latest/${base}`);

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rate from fallback provider');
    }

    const data: { result: string; rates?: Record<string, number> } =
      await response.json();

    if (data.result !== 'success') {
      throw new Error('Fallback provider returned an error');
    }

    const rate = data.rates?.[target];
    if (typeof rate !== 'number') {
      throw new Error('Rate not found in fallback provider response');
    }

    return rate;
  }
}
