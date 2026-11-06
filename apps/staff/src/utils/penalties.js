import { activeBanEnd } from '@qampus/backend';
import { RULES } from '@qampus/core/domain';

const HOUR_MS = 3600 * 1000;

const getTimestamp = (value) => {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

/**
 * The penalty state of one student as the Offenses screen shows it (BUG-017).
 *
 * Nothing is recalculated from pairs of offenses: the ban that counts is the one on the student's profile
 * (`banned_until`, `strike_count`), written in the same transaction as each offense, and "Caused a 24-hour ban"
 * is the `resulted_in_ban` flag stored on the offense when it was recorded.
 * `profile` is the student's users doc when staff could read it. Without it, the ban is taken from this
 * office's own records: an unrevoked offense that caused a ban less than 24 hours ago.
 */
export function getPenaltyState(offenses = [], userId, now = Date.now(), profile = null) {
  const currentTime = getTimestamp(now);

  const relevant = offenses
    .filter((offense) => offense.holder?.user_id === userId && !offense.revoked_at)
    .sort((a, b) => getTimestamp(a.created_at) - getTimestamp(b.created_at) || String(a.id).localeCompare(String(b.id)));

  const triggers = relevant.filter((offense) => offense.resulted_in_ban);
  const latestTrigger = triggers.at(-1) ?? null;

  let bannedUntil = null;
  if (profile) {
    bannedUntil = activeBanEnd(profile, new Date(currentTime))?.toISOString() ?? null;
  } else if (latestTrigger) {
    const end = getTimestamp(latestTrigger.created_at) + RULES.BAN_HOURS * HOUR_MS;
    bannedUntil = end > currentTime ? new Date(end).toISOString() : null;
  }

  return {
    userId,
    strikeCount: profile?.strike_count ?? null,
    activeOffenseCount: relevant.length,
    isBanned: bannedUntil !== null,
    bannedUntil,
    banOffenseIds: bannedUntil && latestTrigger ? [latestTrigger.id] : [],
    triggerOffenseIds: triggers.map((offense) => offense.id),
  };
}

/**
 * Summary of an office's offense records. `profiles` maps a student's uid to their users doc.
 */
export function getPenaltySummary(offenses = [], now = Date.now(), profiles = new Map()) {
  const userIds = [...new Set(offenses.map((offense) => offense.holder?.user_id).filter(Boolean))];
  const states = userIds.map((userId) => getPenaltyState(offenses, userId, now, profiles.get(userId) ?? null));

  return {
    totalOffenses: offenses.length,
    activeOffenses: offenses.filter((o) => !o.revoked_at).length,
    revokedOffenses: offenses.filter((o) => !!o.revoked_at).length,
    bannedUsers: states.filter((state) => state.isBanned).length,
    states,
  };
}
