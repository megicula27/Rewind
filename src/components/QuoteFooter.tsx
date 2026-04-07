import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useMotivationQuote } from '../hooks/useMotivationQuote';
import { Colors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { FontFamily } from '../theme/typography';

type QuoteFooterProps = {
  scope: string;
};

export default function QuoteFooter({ scope }: QuoteFooterProps) {
  const quote = useMotivationQuote(scope);

  return (
    <View style={styles.wrap}>
      <Text style={styles.quoteText}>"{quote.text}"</Text>
      <Text style={styles.authorText}>- {quote.author}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: Spacing.generous,
    paddingHorizontal: Spacing.cozy,
  },
  quoteText: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    lineHeight: 22,
    color: Colors.on_surface_variant,
    textAlign: 'center',
    fontStyle: 'italic',
    opacity: 0.7,
  },
  authorText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 20,
    color: Colors.primary_fixed_variant,
    textAlign: 'center',
    marginTop: Spacing.compact,
    opacity: 0.85,
  },
});
