import EmptyState from '@/components/queue/EmptyState';

export default function OfflineState({
  title = 'Temporarily unavailable',
  message = 'Please wait — this clears on its own.',
  showIconCircle = false,
}) {
  return (
    <EmptyState
      icon="wifi-off"
      showIconCircle={showIconCircle}
      title={title}
      message={message}
    />
  );
}