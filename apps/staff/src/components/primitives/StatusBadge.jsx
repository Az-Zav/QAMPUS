import { RADII, TYPOGRAPHY } from '@/constants';
import { useTheme, useThemedStyles } from '@/hooks';
import { StyleSheet, Text, View } from 'react-native';

// Figma Badge/Status — icon + label pill keyed by TicketStatus (constants/theme).
export default function StatusBadge({ status }) {
  const styles = useThemedStyles(makeStyles);
  const { status: statusTheme } = useTheme();
  const theme = statusTheme[status];
  if (!theme) return null;
  const { Icon } = theme;

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: theme.bg, borderColor: theme.border ?? 'transparent', borderWidth: theme.border ? 1 : 0 },
      ]}
    >
      <Icon size={14} color={theme.text} />
      <Text style={[styles.label, { color: theme.text }]}>{theme.label}</Text>
    </View>
  );
}

const makeStyles = () =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingLeft: 9,
      paddingRight: 10,
      paddingVertical: 4,
      borderRadius: RADII.full,
    },
    label: { fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: TYPOGRAPHY.size.xs },
  });
