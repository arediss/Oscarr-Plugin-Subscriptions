import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { PluginContext, SubscriptionTier, UserSubscription } from './types.js';
import type { SubscriptionStore } from './storage.js';
import { PERM_SUBS_MANAGE, PERM_TIERS_MANAGE } from './permissions.js';

const PREFIX = '/api/plugins/subscription';
const DAY_MS = 86_400_000;

function newTierId(): string {
  return `tier_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function getAuthUserId(request: FastifyRequest): number | null {
  const user = (request as unknown as { user?: { id?: number } }).user;
  return typeof user?.id === 'number' ? user.id : null;
}

export async function registerSubscriptionRoutes(
  app: FastifyInstance,
  ctx: PluginContext,
  store: SubscriptionStore
): Promise<void> {
  // RBAC overrides — the plugin-wide default (AUTH) is too permissive for management routes.
  ctx.registerRoutePermission(`GET:${PREFIX}/tiers`, { permission: PERM_TIERS_MANAGE });
  ctx.registerRoutePermission(`POST:${PREFIX}/tiers`, { permission: PERM_TIERS_MANAGE });
  ctx.registerRoutePermission(`PUT:${PREFIX}/tiers/:id`, { permission: PERM_TIERS_MANAGE });
  ctx.registerRoutePermission(`DELETE:${PREFIX}/tiers/:id`, { permission: PERM_TIERS_MANAGE });

  ctx.registerRoutePermission(`GET:${PREFIX}/subscriptions`, { permission: PERM_SUBS_MANAGE });
  ctx.registerRoutePermission(`GET:${PREFIX}/subscriptions/user/:userId`, { permission: PERM_SUBS_MANAGE });
  ctx.registerRoutePermission(`POST:${PREFIX}/subscriptions`, { permission: PERM_SUBS_MANAGE });
  ctx.registerRoutePermission(`DELETE:${PREFIX}/subscriptions/:userId`, { permission: PERM_SUBS_MANAGE });

  // GET /me: inherit the default /api/plugins/* = AUTH rule (any authenticated user can read their own sub).

  // ── Tiers CRUD ─────────────────────────────────────────────────────
  app.get('/tiers', async () => {
    const data = await store.snapshot();
    return { tiers: data.tiers };
  });

  app.post<{
    Body: { name?: string; description?: string; durationDays?: number; priceLabel?: string; roleName?: string };
  }>('/tiers', async (request, reply) => {
    const { name, description, durationDays, priceLabel, roleName } = request.body ?? {};
    if (!name || typeof durationDays !== 'number' || durationDays <= 0 || typeof priceLabel !== 'string' || !roleName) {
      return reply.status(400).send({ error: 'name, durationDays (>0), priceLabel and roleName are required' });
    }
    try {
      let created: SubscriptionTier | null = null;
      await store.mutate((data) => {
        if (data.tiers.some((t) => t.name === name)) {
          throw new Error('A tier with this name already exists');
        }
        const now = new Date().toISOString();
        const tier: SubscriptionTier = {
          id: newTierId(),
          name,
          description: description || undefined,
          durationDays,
          priceLabel,
          roleName,
          createdAt: now,
          updatedAt: now,
        };
        data.tiers.push(tier);
        created = tier;
      });
      return { tier: created };
    } catch (err) {
      return reply.status(409).send({ error: String((err as Error).message) });
    }
  });

  app.put<{
    Params: { id: string };
    Body: Partial<Pick<SubscriptionTier, 'name' | 'description' | 'durationDays' | 'priceLabel' | 'roleName'>>;
  }>('/tiers/:id', async (request, reply) => {
    const { id } = request.params;
    const patch = request.body ?? {};
    try {
      let updated: SubscriptionTier | null = null;
      await store.mutate((data) => {
        const tier = data.tiers.find((t) => t.id === id);
        if (!tier) throw new Error('Tier not found');
        if (patch.name && patch.name !== tier.name && data.tiers.some((t) => t.name === patch.name)) {
          throw new Error('A tier with this name already exists');
        }
        if (patch.name !== undefined) tier.name = patch.name;
        if (patch.description !== undefined) tier.description = patch.description || undefined;
        if (typeof patch.durationDays === 'number' && patch.durationDays > 0) tier.durationDays = patch.durationDays;
        if (patch.priceLabel !== undefined) tier.priceLabel = patch.priceLabel;
        if (patch.roleName !== undefined && patch.roleName) tier.roleName = patch.roleName;
        tier.updatedAt = new Date().toISOString();
        updated = tier;
      });
      return { tier: updated };
    } catch (err) {
      const message = String((err as Error).message);
      const status = message === 'Tier not found' ? 404 : 409;
      return reply.status(status).send({ error: message });
    }
  });

  app.delete<{ Params: { id: string } }>('/tiers/:id', async (request, reply) => {
    const { id } = request.params;
    try {
      await store.mutate((data) => {
        if (!data.tiers.some((t) => t.id === id)) throw new Error('Tier not found');
        if (Object.values(data.subscriptions).some((s) => s.tierId === id)) {
          throw new Error('Tier is referenced by active subscriptions');
        }
        data.tiers = data.tiers.filter((t) => t.id !== id);
      });
      return { ok: true };
    } catch (err) {
      const message = String((err as Error).message);
      const status = message === 'Tier not found' ? 404 : 409;
      return reply.status(status).send({ error: message });
    }
  });

  // ── Subscriptions ──────────────────────────────────────────────────
  app.get('/subscriptions', async () => {
    const data = await store.snapshot();
    return { subscriptions: data.subscriptions, tiers: data.tiers };
  });

  app.get<{ Params: { userId: string } }>('/subscriptions/user/:userId', async (request, reply) => {
    const userId = Number(request.params.userId);
    if (!Number.isFinite(userId)) return reply.status(400).send({ error: 'Invalid userId' });
    const data = await store.snapshot();
    return { subscription: data.subscriptions[String(userId)] ?? null };
  });

  app.post<{
    Body: { userId?: number; tierId?: string; startedAt?: string };
  }>('/subscriptions', async (request, reply) => {
    const { userId, tierId, startedAt } = request.body ?? {};
    if (typeof userId !== 'number' || !Number.isFinite(userId) || !tierId) {
      return reply.status(400).send({ error: 'userId (number) and tierId are required' });
    }
    try {
      // Validate tier + dates against a snapshot before touching anything.
      const snapshot = await store.snapshot();
      const tier = snapshot.tiers.find((t) => t.id === tierId);
      if (!tier) return reply.status(404).send({ error: 'Tier not found' });
      if (!tier.roleName) return reply.status(400).send({ error: 'Tier has no role configured' });
      const start = startedAt ? new Date(startedAt) : new Date();
      if (Number.isNaN(start.getTime())) return reply.status(400).send({ error: 'Invalid startedAt' });

      // Set the role first — if the role no longer exists in core, this throws
      // before we persist the subscription, so state stays consistent.
      try {
        await ctx.setUserRole(userId, tier.roleName);
      } catch (err) {
        ctx.log.error(`[Subscription] Role "${tier.roleName}" rejected for user ${userId}: ${String(err)}`);
        return reply.status(400).send({ error: `Role "${tier.roleName}" could not be assigned: ${String((err as Error).message)}` });
      }

      let created: UserSubscription | null = null;
      await store.mutate((data) => {
        const liveTier = data.tiers.find((t) => t.id === tierId);
        if (!liveTier) throw new Error('Tier not found');
        const expires = new Date(start.getTime() + liveTier.durationDays * DAY_MS);
        const now = new Date().toISOString();
        const existing = data.subscriptions[String(userId)];
        const sub: UserSubscription = {
          tierId,
          startedAt: start.toISOString(),
          expiresAt: expires.toISOString(),
          notifiedAt: null,
          expiredAt: null,
          plexKickedAt: null,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        data.subscriptions[String(userId)] = sub;
        created = sub;
      });

      return { subscription: created };
    } catch (err) {
      const message = String((err as Error).message);
      const status = message === 'Tier not found' ? 404 : 400;
      return reply.status(status).send({ error: message });
    }
  });

  app.delete<{ Params: { userId: string } }>('/subscriptions/:userId', async (request, reply) => {
    const userId = Number(request.params.userId);
    if (!Number.isFinite(userId)) return reply.status(400).send({ error: 'Invalid userId' });
    let existed = false;
    await store.mutate((data) => {
      if (data.subscriptions[String(userId)]) {
        delete data.subscriptions[String(userId)];
        existed = true;
      }
    });
    if (!existed) return reply.status(404).send({ error: 'Subscription not found' });
    return { ok: true };
  });

  app.get('/me', async (request, reply) => {
    const userId = getAuthUserId(request);
    if (!userId) return reply.status(401).send({ error: 'Unauthorized' });
    const data = await store.snapshot();
    const sub = data.subscriptions[String(userId)] ?? null;
    const tier = sub ? data.tiers.find((t) => t.id === sub.tierId) ?? null : null;
    return { subscription: sub, tier };
  });
}
