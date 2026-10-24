// How strikes and bans move (PRD R-13, R-15). Pure: no Firebase. `profile` is a student's users doc
// ({ strike_count, banned_until }); `banned_until` may be a Date, an ISO string or null.

import { RULES } from '@qampus/core/domain';

const HOUR_MS = 3600 * 1000;

// The penalty after one more offense: the first is a strike; the second resets the count to 0 and sets a flat
// 24-hour ban. `banned_until` is only present when the offense causes a ban.
export function nextPenalty(profile, now = new Date()) {
  const strikes = profile?.strike_count ?? 0;
  if (strikes >= RULES.OFFENSES_PER_BAN - 1) {
    return {
      strike_count: 0,
      banned_until: new Date(now.getTime() + RULES.BAN_HOURS * HOUR_MS),
      resulted_in_ban: true,
    };
  }
  return { strike_count: strikes + 1, resulted_in_ban: false };
}

// The end of the ban as a Date when it is still running, else null
export function activeBanEnd(profile, now = new Date()) {
  if (!profile?.banned_until) return null;
  const end = new Date(profile.banned_until);
  return end.getTime() > now.getTime() ? end : null;
}

// What a revoked offense does to the student's counters (decided for the prototype):
// - an offense that caused the ban lifts the ban and sets the strikes back to 1;
// - any other offense lowers the strikes by 1, only if there is a strike to lower.
// Returns the fields to write, or null when nothing changes.
export function revokeEffect(profile, offense) {
  const strikes = profile?.strike_count ?? 0;
  if (offense.resulted_in_ban) {
    if (strikes === 1 && !profile?.banned_until) return null;
    return { strike_count: 1, banned_until: null };
  }
  if (strikes > 0) return { strike_count: strikes - 1 };
  return null;
}
