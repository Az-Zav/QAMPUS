import theme from '@/theme/theme';
import { Text, View } from 'react-native';

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

export default function Badge({ status, size = 'sm' }) {
  const { bg, border, text } = theme.statusBadge[status];
  const fontSize = size === 'sm' ? theme.typography.size.sm : theme.typography.size.base;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderColor: border,
        borderWidth: 1,
        borderRadius: theme.radii.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xxxs,
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <theme.IconSet name={theme.statusIcon[status]} color={text} size={fontSize} />
      <Text style={{ color: text, fontSize, marginLeft: theme.spacing.xxs }}>
        {statusLabel(status)}
      </Text>
    </View>
  );
}