import { NOTIFICATION_TYPE } from '@qampus/core/domain';
import { ListRowTone } from './theme';

// Icon and tone per notification type: the Notifications list and the in-app banner share it
export const NOTIFICATION_STYLE = Object.freeze({
  [NOTIFICATION_TYPE.QUEUE_CONFIRMED]: { icon: 'ticket-outline', tone: ListRowTone.HIGHLIGHT },
  [NOTIFICATION_TYPE.YOUR_TURN]: { icon: 'notifications-outline', tone: ListRowTone.HIGHLIGHT },
  [NOTIFICATION_TYPE.APPROACHING_TURN]: { icon: 'timer-outline', tone: ListRowTone.HIGHLIGHT },
  [NOTIFICATION_TYPE.NO_SHOW]: { icon: 'person-remove-outline', tone: ListRowTone.ERROR },
  [NOTIFICATION_TYPE.QUEUE_CANCELLED]: { icon: 'close-circle-outline', tone: ListRowTone.NEUTRAL },
  [NOTIFICATION_TYPE.SERVICE_COMPLETED]: { icon: 'checkmark-circle-outline', tone: ListRowTone.SUCCESS },
  [NOTIFICATION_TYPE.WARNING]: { icon: 'warning-outline', tone: ListRowTone.ERROR },
  [NOTIFICATION_TYPE.GLOBAL_ANNOUNCEMENT]: { icon: 'megaphone-outline', tone: ListRowTone.NEUTRAL },
  [NOTIFICATION_TYPE.OFFENSE_REVOKED]: { icon: 'shield-checkmark-outline', tone: ListRowTone.SUCCESS },
});
