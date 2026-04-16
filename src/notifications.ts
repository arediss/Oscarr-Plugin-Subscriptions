export const NOTIF_EXPIRING_SOON = 'subscription_expiring_soon';
export const NOTIF_EXPIRED = 'subscription_expired';

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export function buildExpiringSoonPayload(tierName: string, expiresAt: string, daysLeft: number) {
  return {
    type: NOTIF_EXPIRING_SOON,
    title: 'Your subscription expires soon',
    message: `Your "${tierName}" subscription expires in ${daysLeft} day(s) (${formatDate(expiresAt)}). Contact the admin to renew.`,
    metadata: { tierName, expiresAt, daysLeft },
  };
}

export function buildExpiredPayload(tierName: string, downgradeRole: string) {
  return {
    type: NOTIF_EXPIRED,
    title: 'Your subscription has expired',
    message: `Your "${tierName}" subscription has expired. Your role was changed to "${downgradeRole}".`,
    metadata: { tierName, downgradeRole },
  };
}
