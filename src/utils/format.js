// Display formatters shared by selectors and screens.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const pad2 = (n) => String(n).padStart(2, '0');

// 75 -> "1:15"
export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  return `${Math.floor(safe / 60)}:${pad2(safe % 60)}`;
}

// "08:00:00" -> "08:00"
export function formatClock(time) {
  return time ? time.slice(0, 5) : '';
}

// Date -> "2:05 PM"
export function formatTime(date) {
  const d = new Date(date);
  const hours = d.getHours() % 12 || 12;
  return `${hours}:${pad2(d.getMinutes())} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
}

// Date -> "Sep 27, 2:05 PM"
export function formatDateTime(date) {
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${formatTime(d)}`;
}

// Date -> "Sep 27, 2026"
export function formatDate(date) {
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

// Date relative to now -> "Just now" | "5m ago" | "3h ago" | "Yesterday" | "Sep 27"
export function formatRelative(date, now = Date.now()) {
  const minutes = Math.floor((new Date(now) - new Date(date)) / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const days = daysBetween(date, now);
  if (days === 0) return `${Math.floor(minutes / 60)}h ago`;
  if (days === 1) return 'Yesterday';
  const d = new Date(date);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Now -> "Good Morning" | "Good Afternoon" | "Good Evening"
export function greetingFor(now) {
  const hour = new Date(now).getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

// Whole calendar days between two dates (0 = same day)
export function daysBetween(from, to) {
  const start = new Date(from);
  const end = new Date(to);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((end - start) / 86400000);
}
