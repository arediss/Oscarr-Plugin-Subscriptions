import type { PluginContext } from './types.js';
import type { SubscriptionStore } from './storage.js';
import { getSettings } from './settings.js';
import { buildExpiredPayload, buildExpiringSoonPayload } from './notifications.js';
import { resolvePlexOps, unsharePlexUser } from './plex.js';

export interface JobResult {
  expired: number;
  notified: number;
  kicked: number;
  errors: number;
}

const DAY_MS = 86_400_000;

export async function runSubscriptionCheck(ctx: PluginContext, store: SubscriptionStore): Promise<JobResult> {
  const settings = await getSettings(ctx);
  const now = new Date();
  const noticeThreshold = new Date(now.getTime() + settings.notifyDaysBefore * DAY_MS);

  let expired = 0;
  let notified = 0;
  let kicked = 0;
  let errors = 0;

  const plexOpsPromise = settings.autoKickPlex ? resolvePlexOps(ctx) : Promise.resolve(null);
  const plexOps = await plexOpsPromise;
  if (settings.autoKickPlex && !plexOps) {
    ctx.log.warn('[Subscription] autoKickPlex is enabled but Plex service config (token/machineId) is missing — auto-kick pass will be skipped');
  }

  await store.mutate(async (data) => {
    for (const [userIdStr, sub] of Object.entries(data.subscriptions)) {
      const userId = Number(userIdStr);
      const expiresAt = new Date(sub.expiresAt);
      const tier = data.tiers.find((t) => t.id === sub.tierId);
      const tierName = tier?.name ?? 'unknown';

      if (!sub.expiredAt && expiresAt <= now) {
        try {
          await ctx.setUserRole(userId, settings.downgradeRoleName);
          if (settings.notifyOnExpiration) {
            await ctx.sendUserNotification(userId, buildExpiredPayload(tierName, settings.downgradeRoleName));
          }
          sub.expiredAt = now.toISOString();
          sub.updatedAt = now.toISOString();
          expired++;
        } catch (err) {
          ctx.log.error(`[Subscription] Failed to expire user ${userId}: ${String(err)}`);
          errors++;
        }
        continue;
      }

      if (!sub.expiredAt && !sub.notifiedAt && expiresAt <= noticeThreshold) {
        try {
          const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS));
          await ctx.sendUserNotification(userId, buildExpiringSoonPayload(tierName, sub.expiresAt, daysLeft));
          sub.notifiedAt = now.toISOString();
          sub.updatedAt = now.toISOString();
          notified++;
        } catch (err) {
          ctx.log.error(`[Subscription] Failed to notify user ${userId}: ${String(err)}`);
          errors++;
        }
      }

      if (plexOps && sub.expiredAt && !sub.plexKickedAt) {
        const kickDueAt = new Date(sub.expiresAt).getTime() + settings.autoKickDelayDays * DAY_MS;
        if (now.getTime() >= kickDueAt) {
          try {
            const didKick = await unsharePlexUser(ctx, userId, plexOps);
            sub.plexKickedAt = now.toISOString();
            sub.updatedAt = now.toISOString();
            if (didKick) {
              kicked++;
              try {
                await ctx.setUserDisabled(userId, true);
              } catch (err) {
                ctx.log.error(`[Subscription] Kicked user ${userId} from Plex but failed to mark account disabled: ${String(err)}`);
              }
            }
          } catch (err) {
            ctx.log.error(`[Subscription] Failed to unshare Plex for user ${userId}: ${String(err)}`);
            errors++;
          }
        }
      }
    }
  });

  if (expired > 0 || notified > 0 || kicked > 0 || errors > 0) {
    ctx.log.info(`[Subscription] check: expired=${expired} notified=${notified} kicked=${kicked} errors=${errors}`);
  }

  return { expired, notified, kicked, errors };
}
