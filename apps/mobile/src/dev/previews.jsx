// TEMPORARY — dev-only preview states for every screen, in one place.
//
// Usage in a screen:
//   const preview = usePreview('home'); // DEV-PREVIEW
//   {preview.bar /* DEV-PREVIEW */}
//   const active = preview.data?.active ?? liveActive; // DEV-PREVIEW
//
// Each screen's first state is 'live' (real hook data, data = null). Other states
// return fixture `data` shaped like the hook output the screen overrides.
//
// CLEANUP: delete this file, then search the repo for "DEV-PREVIEW" and on each hit
// remove the line, except: collapse `preview.data?.x ?? liveX` to `liveX`, and delete
// a tagged `if (preview...) { ... }` together with its whole block.
// `npx expo lint` + `npx tsc --noEmit` flag anything missed.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RADII, SPACING, TYPOGRAPHY } from '@/constants';
import { useThemedStyles } from '@/hooks';

const minutesAgo = (m) => new Date(Date.now() - m * 60000).toISOString();
const hoursFromNow = (h) => new Date(Date.now() + h * 3600000).toISOString();
const daysAgo = (d, hour, minute = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
};

const offense = (id, type, ticketNumber, createdAt, extra = {}) => ({
  id, type, ticket_number: ticketNumber, created_at: createdAt, resulted_in_ban: false, revoked_at: null, ...extra,
});

// screen -> { state: data }. 'live' must stay first and map to null.
const PREVIEWS = {
  // home.jsx — overrides useMyTickets().active; `offline` shows the offline empty state
  home: {
    live: null,
    empty: { active: [] },
    offline: { active: [], offline: true },
  },

  // notifications.jsx — overrides useNotifications().notifications
  notifications: {
    live: null,
    empty: { notifications: [] },
  },

  // bans.jsx — replaces usePenaltyRecord() output; offenses newest first
  bans: {
    live: null,
    banned: {
      strikeCount: 2,
      bannedUntil: hoursFromNow(20),
      offenses: [
        offense('prev_b2', 'CANCELLED_AFTER_CALL', 'R-09-30-014', minutesAgo(240), { resulted_in_ban: true }),
        offense('prev_b1', 'NO_SHOW', 'C-09-29-022', daysAgo(1, 10, 15)),
      ],
    },
    warning: {
      strikeCount: 1,
      bannedUntil: null,
      offenses: [offense('prev_w1', 'NO_SHOW', 'C-09-29-022', daysAgo(1, 10, 15))],
    },
    history: {
      strikeCount: 0,
      bannedUntil: null,
      offenses: [
        offense('prev_h2', 'NO_SHOW', 'L-09-26-008', daysAgo(4, 9, 40), { revoked_at: daysAgo(3, 16, 0) }),
        offense('prev_h1', 'CANCELLED_AFTER_CALL', 'R-09-12-041', daysAgo(18, 14, 5), { resulted_in_ban: true }),
      ],
    },
    clean: { strikeCount: 0, bannedUntil: null, offenses: [] },
  },
};

export function usePreview(screen, { barStyle } = {}) {
  const states = Object.keys(PREVIEWS[screen]);
  const [state, setState] = useState(states[0]);

  if (!__DEV__) return { state: states[0], data: null, bar: null };

  return {
    state,
    data: PREVIEWS[screen][state],
    bar: <PreviewBar states={states} value={state} onChange={setState} style={barStyle} />,
  };
}

function PreviewBar({ states, value, onChange, style }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.toolbar, style]}>
      <Text style={styles.label}>Preview state:</Text>
      <View style={styles.pills}>
        {states.map((s) => (
          <Pressable key={s} style={[styles.pill, value === s && styles.activePill]} onPress={() => onChange(s)}>
            <Text style={[styles.pillText, value === s && styles.activePillText]}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (c) => StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.xxs,
    backgroundColor: c.white,
    padding: SPACING.xs,
    borderRadius: RADII.md,
    borderWidth: 1,
    borderColor: c.border,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.size.xs,
    color: c.slate,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xxs },
  pill: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxxs,
    borderRadius: RADII.full,
    backgroundColor: c.disabledBg,
  },
  activePill: { backgroundColor: c.inverse },
  pillText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.size.xs,
    color: c.ink,
    textTransform: 'capitalize',
  },
  activePillText: { color: c.onInverse },
});
