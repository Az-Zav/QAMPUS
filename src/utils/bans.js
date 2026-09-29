// QAMPUS Bans Utilities
// Pure helpers for evaluating ban state against current time.

/**
 * Determines whether a user ban is currently active.
 *
 * @param {import('@/types').ActiveBan | null | undefined} ban - The active ban record
 * @param {Date|string|number} now - The reference current timestamp
 * @returns {boolean} True if the ban is active and unexpired
 */
export function isBanned(ban, now) {
  if (!ban || !ban.expiresAt) return false;

  const nowDate = now instanceof Date ? now : (now ? new Date(now) : new Date());
  const expiresDate = new Date(ban.expiresAt);

  return expiresDate.getTime() > nowDate.getTime();
}
