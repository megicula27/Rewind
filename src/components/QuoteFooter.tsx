import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useMotivationQuote } from '../hooks/useMotivationQuote';
import type { ThemeColors } from '../theme/colors';
import { Spacing } from '../theme/spacing';
import { FontFamily } from '../theme/typography';
import { useTheme } from '../theme/ThemeContext';

type QuoteFooterProps = {
  scope: string;
  shift?: number;
};

export default function QuoteFooter({ scope, shift = 0 }: QuoteFooterProps) {
  const quote = useMotivationQuote(scope, shift);
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrap}>
      <Text style={styles.quoteText}>{'"'}{quote.text}{'"'}</Text>
      <Text style={styles.authorText}>- {quote.author}</Text>
    </View>
  );
}

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: {
      alignItems: 'center',
      marginTop: Spacing.generous,
      paddingHorizontal: Spacing.cozy,
    },
    quoteText: {
      fontFamily: FontFamily.medium,
      fontSize: 14,
      lineHeight: 22,
      color: colors.on_surface_variant,
      textAlign: 'center',
      fontStyle: 'italic',
      opacity: 0.7,
    },
    authorText: {
      fontFamily: FontFamily.medium,
      fontSize: 13,
      lineHeight: 20,
      color: colors.primary_fixed_variant,
      textAlign: 'center',
      marginTop: Spacing.compact,
      opacity: 0.85,
    },
  });

