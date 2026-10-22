import CenteredMessage from '@/components/shell/CenteredMessage';
import { OUTAGE_COPY } from '@/constants';
import { WifiOff } from '@/icons';

// Figma Staff/Outage — shared by W03–W05 and D01 (R-36). No retry control: it clears on its own
// when polling succeeds, and nothing is held locally.
export default function Outage() {
  return <CenteredMessage Icon={WifiOff} title={OUTAGE_COPY.title} body={OUTAGE_COPY.body} />;
}
