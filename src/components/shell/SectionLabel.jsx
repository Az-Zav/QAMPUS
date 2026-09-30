import { SPACING, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';
import { StyleSheet, Text } from 'react-native';

// Figma Shell/SectionLabel — small tracked group heading ("Recent", "OFFENSE HISTORY", "GENERAL").
export default function SectionLabel({ text, style }) {
  const styles = useThemedStyles(makeStyles);
  return <Text style={[styles.label, style]} accessibilityRole="header">{text}</Text>;
}

const makeStyles = (c) => StyleSheet.create({
  label: {
    paddingHorizontal: SPACING.xxs,
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    lineHeight: Math.round(TYPOGRAPHY.size.xs * TYPOGRAPHY.lineHeight.normal),
    letterSpacing: 1.1,
    color: c.slate,
  },
});
