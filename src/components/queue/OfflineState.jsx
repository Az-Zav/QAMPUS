import EmptyState from './EmptyState';

export default function OfflineState({
  title = 'Temporarily unavailable',
  message = 'Please wait — this clears on its own.',
  showIconCircle = false,
}) {
  return (
    <EmptyState
      showIconCircle={showIconCircle}
      title={title}
      message={message}
    />
  );
}