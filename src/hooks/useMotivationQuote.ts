import { useEffect, useState } from 'react';

import {
  type MotivationQuote,
  getFallbackQuote,
  getMotivationQuotes,
  pickMotivationQuote,
} from '../quotes/service';

export function useMotivationQuote(scope: string, shift = 0) {
  const [quote, setQuote] = useState<MotivationQuote>(() => getFallbackQuote(scope, shift));

  useEffect(() => {
    let isCancelled = false;

    const loadQuote = async () => {
      const quotes = await getMotivationQuotes();
      if (isCancelled) {
        return;
      }

      setQuote(pickMotivationQuote(quotes, scope, shift));
    };

    void loadQuote();

    return () => {
      isCancelled = true;
    };
  }, [scope, shift]);

  return quote;
}
