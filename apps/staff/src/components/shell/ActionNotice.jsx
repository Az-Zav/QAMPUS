import InlineBanner, { BannerTone } from '@/components/shell/InlineBanner';
import { ACTION_ERROR_COPY } from '@/constants';
import { useQueueStore } from '@/providers/QueueProvider';

// Why the last staff action was refused, above the page content on every console screen
export default function ActionNotice() {
  const { notice, dismissNotice } = useQueueStore();
  if (!notice) return null;
  return (
    <InlineBanner
      tone={BannerTone.DANGER}
      message={notice.message}
      actionLabel={ACTION_ERROR_COPY.dismiss}
      onAction={dismissNotice}
    />
  );
}
