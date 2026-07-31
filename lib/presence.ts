// Matches the ~60s heartbeat interval in auth-context.tsx with a 2x margin
// for a missed beat or network hiccup, rather than treating a member as
// offline the instant one heartbeat is late.
const ONLINE_THRESHOLD_MS = 2 * 60 * 1000;

export function isOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false;
  return Date.now() - new Date(lastSeenAt).getTime() < ONLINE_THRESHOLD_MS;
}
