import theme from '@/theme/theme';
import { Pressable, Text, View } from 'react-native';

function statusLabel(status) {
  const labels = {
    waiting: 'Waiting',
    yourTurn: 'Your turn',
    expired: 'Expired',
    inService: 'In service',
    completed: 'Completed',
    cancelled: 'Cancelled',
    noShow: 'No-show',
  };
  return labels[status] ?? status;
}

export default function Badge({ status, size = 'sm', onPress, icon, label }) {
  const isActionable = typeof onPress === 'function';
  const Wrapper = isActionable ? Pressable : View;

  // If a status is given, pull its style from the theme. Otherwise (custom badge,
  // like the scanner action), fall back to gold/ink — matching the "yourTurn" look.
  const { bg, border, text } = status
    ? theme.statusBadge[status]
    : { bg: theme.colors.gold, border: null, text: theme.colors.ink };

  const fontSize = size === 'sm' ? theme.typography.size.sm : theme.typography.size.base;
  const iconName = icon ?? theme.statusIcon[status];
  const displayLabel = label ?? statusLabel(status);

  return (
    <Wrapper
      onPress={onPress}
      style={{
        backgroundColor: bg,
        borderWidth: border ? 1 : 0,
        borderColor: border ?? 'transparent',
        borderRadius: theme.radii.full,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.xs,
      }}
    >
      {iconName && <theme.IconSet name={iconName} color={text} size={fontSize + 2} />}
      <Text
        style={{
          color: text,
          fontSize,
          lineHeight: fontSize * 1.2,
          fontFamily: theme.typography.fontFamily.medium,
        }}
      >
        {displayLabel}
      </Text>
    </Wrapper>
  );
}