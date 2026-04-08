export type MotivationQuote = {
  text: string;
  author: string;
  source: 'api' | 'fallback';
};

type ZenQuoteResponse = {
  q?: string;
  a?: string;
};

const ZEN_QUOTES_URL = 'https://zenquotes.io/api/quotes';
const QUOTE_CACHE_TTL_MS = 1000 * 60 * 60 * 6;

const FALLBACK_QUOTES: MotivationQuote[] = [
  { text: 'Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.', author: 'John C. Maxwell', source: 'fallback' },
  { text: 'The future depends on what you do today.', author: 'Mahatma Gandhi', source: 'fallback' },
  { text: 'Success is the sum of small efforts, repeated day in and day out.', author: 'Robert Collier', source: 'fallback' },
  { text: 'It always seems impossible until it is done.', author: 'Nelson Mandela', source: 'fallback' },
  { text: 'Take care of your body. It is the only place you have to live.', author: 'Jim Rohn', source: 'fallback' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain', source: 'fallback' },
  { text: 'A year from now you may wish you had started today.', author: 'Karen Lamb', source: 'fallback' },
  { text: 'Well begun is half done.', author: 'Aristotle', source: 'fallback' },
  { text: 'Do something today that your future self will thank you for.', author: 'Sean Patrick Flanery', source: 'fallback' },
  { text: 'The groundwork for all happiness is good health.', author: 'Leigh Hunt', source: 'fallback' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Aristotle', source: 'fallback' },
  { text: 'Knowing is not enough; we must apply. Willing is not enough; we must do.', author: 'Johann Wolfgang von Goethe', source: 'fallback' },
];

let cachedQuotes: MotivationQuote[] | null = null;
let cachedAt = 0;
let inFlightRequest: Promise<MotivationQuote[]> | null = null;

function normalizeQuotes(payload: ZenQuoteResponse[]) {
  return payload
    .map((entry) => ({
      text: entry.q?.trim() ?? '',
      author: entry.a?.trim() ?? 'Unknown',
      source: 'api' as const,
    }))
    .filter((entry) => entry.text.length > 0);
}

export async function getMotivationQuotes() {
  const now = Date.now();

  if (cachedQuotes && now - cachedAt < QUOTE_CACHE_TTL_MS) {
    return cachedQuotes;
  }

  if (inFlightRequest) {
    return inFlightRequest;
  }

  inFlightRequest = (async () => {
    try {
      const response = await fetch(ZEN_QUOTES_URL);
      if (!response.ok) {
        throw new Error(`Quote API returned ${response.status}`);
      }

      const payload = (await response.json()) as ZenQuoteResponse[];
      const normalized = normalizeQuotes(Array.isArray(payload) ? payload : []);
      if (normalized.length === 0) {
        throw new Error('Quote API returned no usable quotes.');
      }

      cachedQuotes = normalized;
      cachedAt = Date.now();
      return normalized;
    } catch (error) {
      console.warn('Falling back to bundled motivation quotes:', error);
      cachedQuotes = FALLBACK_QUOTES;
      cachedAt = Date.now();
      return FALLBACK_QUOTES;
    } finally {
      inFlightRequest = null;
    }
  })();

  return inFlightRequest;
}

export function getFallbackQuote(scope: string, shift = 0) {
  return pickMotivationQuote(FALLBACK_QUOTES, scope, shift);
}

export function pickMotivationQuote(quotes: MotivationQuote[], scope: string, shift = 0) {
  if (quotes.length === 0) {
    return FALLBACK_QUOTES[0];
  }

  let hash = 0;
  for (let index = 0; index < scope.length; index += 1) {
    hash = (hash * 33 + scope.charCodeAt(index)) | 0;
  }

  const index = Math.abs(hash + shift * 997) % quotes.length;
  return quotes[index] ?? quotes[0];
}
