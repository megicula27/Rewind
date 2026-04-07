import { useEffect, useState } from 'react';

import {
  type MotivationQuote,
  getFallbackQuote,
  getMotivationQuotes,
  pickMotivationQuote,
} from '../quotes/service';

export function useMotivationQuote(scope: string) {
  const [quote, setQuote] = useState<MotivationQuote>(() => getFallbackQuote(scope));

  useEffect(() => {
    let isCancelled = false;

    const loadQuote = async () => {
      const quotes = await getMotivationQuotes();
      if (isCancelled) {
        return;
      }

      setQuote(pickMotivationQuote(quotes, scope));
    };

    void loadQuote();

    return () => {
      isCancelled = true;
    };
  }, [scope]);

  return quote;
}
