import Dot from '@/components/primitives/Dot';
import { FOOTER_COPY, STAFF_FONT, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// Figma StatusFooter — live indicator on the left, page context in the middle and on the right.
export default function StatusFooter({ center, right }) {
  const styles = useThemedStyles(makeStyles);
  const { colors } = useTheme();

  return (
    <View style={styles.footer}>
      <View style={styles.live}>
        <Dot color={colors.success} size={9} />
        <Text style={styles.liveLabel}>{FOOTER_COPY.updated}</Text>
      </View>
      <Text style={styles.text}>{center}</Text>
      <Text style={styles.text}>{right}</Text>
    </View>
  );
}

const makeStyles = (c) =>
  StyleSheet.create({
    footer: {
      minHeight: 52,
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      columnGap: 24,
      rowGap: 4,
    },
    live: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    liveLabel: { fontFamily: STAFF_FONT.semibold, fontSize: TYPOGRAPHY.size.base, color: c.slate },
    text: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.base, color: c.slate },
  });
