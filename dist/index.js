import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/index.ts
import { readFile as readFile2 } from "fs/promises";
import { join as join2, dirname } from "path";
import { fileURLToPath } from "url";

// src/permissions.ts
var PERM_TIERS_MANAGE = "subscription.tiers.manage";
var PERM_SUBS_MANAGE = "subscription.subs.manage";
var PERMISSIONS = [
  { key: PERM_TIERS_MANAGE, description: "Create, edit and delete subscription tiers" },
  { key: PERM_SUBS_MANAGE, description: "Assign, revoke and view all user subscriptions" }
];

// src/storage.ts
import { readFile, writeFile, rename, unlink } from "fs/promises";
import { join } from "path";
var FILE_NAME = "data.json";
var CURRENT_VERSION = 1;
var EMPTY = {
  version: CURRENT_VERSION,
  tiers: [],
  subscriptions: {}
};
var SubscriptionStore = class {
  ctx;
  cache = null;
  /** Chain used to serialize writes. Always resolves (errors are caught locally and re-thrown to the caller via the returned promise), so a failing mutator never leaves the chain in a rejected state that would break the next caller. */
  writeChain = Promise.resolve();
  constructor(ctx) {
    this.ctx = ctx;
  }
  async filePath() {
    const dir = await this.ctx.getPluginDataDir();
    return join(dir, FILE_NAME);
  }
  async load() {
    if (this.cache) return this.cache;
    const path = await this.filePath();
    try {
      const raw = await readFile(path, "utf-8");
      const parsed = JSON.parse(raw);
      const subs = parsed.subscriptions && typeof parsed.subscriptions === "object" ? parsed.subscriptions : {};
      for (const sub of Object.values(subs)) {
        if (sub.plexKickedAt === void 0) {
          sub.plexKickedAt = null;
        }
      }
      this.cache = {
        version: parsed.version ?? CURRENT_VERSION,
        tiers: Array.isArray(parsed.tiers) ? parsed.tiers : [],
        subscriptions: subs
      };
    } catch (err) {
      const error = err;
      if (error.code === "ENOENT") {
        this.cache = { ...EMPTY, subscriptions: {}, tiers: [] };
      } else if (err instanceof SyntaxError) {
        const corruptPath = path + ".corrupt-" + Date.now();
        this.ctx.log.error(`[Subscription] data.json is corrupted, moved to ${corruptPath}. Starting with an empty store.`);
        try {
          await rename(path, corruptPath);
        } catch {
        }
        this.cache = { ...EMPTY, subscriptions: {}, tiers: [] };
      } else {
        throw err;
      }
    }
    return this.cache;
  }
  /**
   * Runs a mutator under a serialized write lock. Writes are persisted via a
   * tmp-file + rename sequence so a crash mid-write can never leave a truncated
   * data.json. The mutator sees a live reference to the cached object and may
   * mutate it directly; throw to abort the mutation without persisting.
   */
  async mutate(mutator) {
    const run = async () => {
      const data = await this.load();
      await mutator(data);
      data.version = CURRENT_VERSION;
      const path = await this.filePath();
      const tmpPath = path + ".tmp";
      await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
      try {
        await rename(tmpPath, path);
      } catch (renameErr) {
        try {
          await unlink(tmpPath);
        } catch {
        }
        throw renameErr;
      }
      this.cache = data;
      return data;
    };
    const next = this.writeChain.catch(() => void 0).then(run);
    this.writeChain = next.catch(() => void 0);
    return next;
  }
  async snapshot() {
    const data = await this.load();
    return JSON.parse(JSON.stringify(data));
  }
};

// src/routes.ts
var PREFIX = "/api/plugins/subscription";
var DAY_MS = 864e5;
function newTierId() {
  return `tier_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
function getAuthUserId(request) {
  const user = request.user;
  return typeof user?.id === "number" ? user.id : null;
}
async function registerSubscriptionRoutes(app, ctx, store) {
  ctx.registerRoutePermission(`GET:${PREFIX}/tiers`, { permission: PERM_TIERS_MANAGE });
  ctx.registerRoutePermission(`POST:${PREFIX}/tiers`, { permission: PERM_TIERS_MANAGE });
  ctx.registerRoutePermission(`PUT:${PREFIX}/tiers/:id`, { permission: PERM_TIERS_MANAGE });
  ctx.registerRoutePermission(`DELETE:${PREFIX}/tiers/:id`, { permission: PERM_TIERS_MANAGE });
  ctx.registerRoutePermission(`GET:${PREFIX}/subscriptions`, { permission: PERM_SUBS_MANAGE });
  ctx.registerRoutePermission(`GET:${PREFIX}/subscriptions/user/:userId`, { permission: PERM_SUBS_MANAGE });
  ctx.registerRoutePermission(`POST:${PREFIX}/subscriptions`, { permission: PERM_SUBS_MANAGE });
  ctx.registerRoutePermission(`DELETE:${PREFIX}/subscriptions/:userId`, { permission: PERM_SUBS_MANAGE });
  app.get("/tiers", async () => {
    const data = await store.snapshot();
    return { tiers: data.tiers };
  });
  app.post("/tiers", async (request, reply) => {
    const { name, description, durationDays, priceLabel, roleName } = request.body ?? {};
    if (!name || typeof durationDays !== "number" || durationDays <= 0 || typeof priceLabel !== "string" || !roleName) {
      return reply.status(400).send({ error: "name, durationDays (>0), priceLabel and roleName are required" });
    }
    try {
      let created = null;
      await store.mutate((data) => {
        if (data.tiers.some((t) => t.name === name)) {
          throw new Error("A tier with this name already exists");
        }
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const tier = {
          id: newTierId(),
          name,
          description: description || void 0,
          durationDays,
          priceLabel,
          roleName,
          createdAt: now,
          updatedAt: now
        };
        data.tiers.push(tier);
        created = tier;
      });
      return { tier: created };
    } catch (err) {
      return reply.status(409).send({ error: String(err.message) });
    }
  });
  app.put("/tiers/:id", async (request, reply) => {
    const { id } = request.params;
    const patch = request.body ?? {};
    try {
      let updated = null;
      await store.mutate((data) => {
        const tier = data.tiers.find((t) => t.id === id);
        if (!tier) throw new Error("Tier not found");
        if (patch.name && patch.name !== tier.name && data.tiers.some((t) => t.name === patch.name)) {
          throw new Error("A tier with this name already exists");
        }
        if (patch.name !== void 0) tier.name = patch.name;
        if (patch.description !== void 0) tier.description = patch.description || void 0;
        if (typeof patch.durationDays === "number" && patch.durationDays > 0) tier.durationDays = patch.durationDays;
        if (patch.priceLabel !== void 0) tier.priceLabel = patch.priceLabel;
        if (patch.roleName !== void 0 && patch.roleName) tier.roleName = patch.roleName;
        tier.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
        updated = tier;
      });
      return { tier: updated };
    } catch (err) {
      const message = String(err.message);
      const status = message === "Tier not found" ? 404 : 409;
      return reply.status(status).send({ error: message });
    }
  });
  app.delete("/tiers/:id", async (request, reply) => {
    const { id } = request.params;
    try {
      await store.mutate((data) => {
        if (!data.tiers.some((t) => t.id === id)) throw new Error("Tier not found");
        if (Object.values(data.subscriptions).some((s) => s.tierId === id)) {
          throw new Error("Tier is referenced by active subscriptions");
        }
        data.tiers = data.tiers.filter((t) => t.id !== id);
      });
      return { ok: true };
    } catch (err) {
      const message = String(err.message);
      const status = message === "Tier not found" ? 404 : 409;
      return reply.status(status).send({ error: message });
    }
  });
  app.get("/subscriptions", async () => {
    const data = await store.snapshot();
    return { subscriptions: data.subscriptions, tiers: data.tiers };
  });
  app.get("/subscriptions/user/:userId", async (request, reply) => {
    const userId = Number(request.params.userId);
    if (!Number.isFinite(userId)) return reply.status(400).send({ error: "Invalid userId" });
    const data = await store.snapshot();
    return { subscription: data.subscriptions[String(userId)] ?? null };
  });
  app.post("/subscriptions", async (request, reply) => {
    const { userId, tierId, startedAt } = request.body ?? {};
    if (typeof userId !== "number" || !Number.isFinite(userId) || !tierId) {
      return reply.status(400).send({ error: "userId (number) and tierId are required" });
    }
    try {
      const snapshot = await store.snapshot();
      const tier = snapshot.tiers.find((t) => t.id === tierId);
      if (!tier) return reply.status(404).send({ error: "Tier not found" });
      if (!tier.roleName) return reply.status(400).send({ error: "Tier has no role configured" });
      const start = startedAt ? new Date(startedAt) : /* @__PURE__ */ new Date();
      if (Number.isNaN(start.getTime())) return reply.status(400).send({ error: "Invalid startedAt" });
      try {
        await ctx.setUserRole(userId, tier.roleName);
      } catch (err) {
        ctx.log.error(`[Subscription] Role "${tier.roleName}" rejected for user ${userId}: ${String(err)}`);
        return reply.status(400).send({ error: `Role "${tier.roleName}" could not be assigned: ${String(err.message)}` });
      }
      let created = null;
      await store.mutate((data) => {
        const liveTier = data.tiers.find((t) => t.id === tierId);
        if (!liveTier) throw new Error("Tier not found");
        const expires = new Date(start.getTime() + liveTier.durationDays * DAY_MS);
        const now = (/* @__PURE__ */ new Date()).toISOString();
        const existing = data.subscriptions[String(userId)];
        const sub = {
          tierId,
          startedAt: start.toISOString(),
          expiresAt: expires.toISOString(),
          notifiedAt: null,
          expiredAt: null,
          plexKickedAt: null,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now
        };
        data.subscriptions[String(userId)] = sub;
        created = sub;
      });
      return { subscription: created };
    } catch (err) {
      const message = String(err.message);
      const status = message === "Tier not found" ? 404 : 400;
      return reply.status(status).send({ error: message });
    }
  });
  app.delete("/subscriptions/:userId", async (request, reply) => {
    const userId = Number(request.params.userId);
    if (!Number.isFinite(userId)) return reply.status(400).send({ error: "Invalid userId" });
    let existed = false;
    await store.mutate((data) => {
      if (data.subscriptions[String(userId)]) {
        delete data.subscriptions[String(userId)];
        existed = true;
      }
    });
    if (!existed) return reply.status(404).send({ error: "Subscription not found" });
    return { ok: true };
  });
  app.get("/me", async (request, reply) => {
    const userId = getAuthUserId(request);
    if (!userId) return reply.status(401).send({ error: "Unauthorized" });
    const data = await store.snapshot();
    const sub = data.subscriptions[String(userId)] ?? null;
    const tier = sub ? data.tiers.find((t) => t.id === sub.tierId) ?? null : null;
    return { subscription: sub, tier };
  });
}

// src/settings.ts
var DEFAULTS = {
  downgradeRoleName: "user",
  notifyDaysBefore: 7,
  notifyOnExpiration: true,
  autoKickPlex: false,
  autoKickDelayDays: 3
};
async function getSettings(ctx) {
  const downgrade = await ctx.getSetting("downgradeRoleName");
  const days = await ctx.getSetting("notifyDaysBefore");
  const onExp = await ctx.getSetting("notifyOnExpiration");
  const kickOn = await ctx.getSetting("autoKickPlex");
  const kickDelay = await ctx.getSetting("autoKickDelayDays");
  return {
    downgradeRoleName: typeof downgrade === "string" && downgrade ? downgrade : DEFAULTS.downgradeRoleName,
    notifyDaysBefore: typeof days === "number" && days >= 0 ? days : DEFAULTS.notifyDaysBefore,
    notifyOnExpiration: typeof onExp === "boolean" ? onExp : DEFAULTS.notifyOnExpiration,
    autoKickPlex: typeof kickOn === "boolean" ? kickOn : DEFAULTS.autoKickPlex,
    autoKickDelayDays: typeof kickDelay === "number" && kickDelay >= 0 ? kickDelay : DEFAULTS.autoKickDelayDays
  };
}

// src/notifications.ts
var NOTIF_EXPIRING_SOON = "subscription_expiring_soon";
var NOTIF_EXPIRED = "subscription_expired";
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(void 0, { year: "numeric", month: "2-digit", day: "2-digit" });
}
function buildExpiringSoonPayload(tierName, expiresAt, daysLeft) {
  return {
    type: NOTIF_EXPIRING_SOON,
    title: "Your subscription expires soon",
    message: `Your "${tierName}" subscription expires in ${daysLeft} day(s) (${formatDate(expiresAt)}). Contact the admin to renew.`,
    metadata: { tierName, expiresAt, daysLeft }
  };
}
function buildExpiredPayload(tierName, downgradeRole) {
  return {
    type: NOTIF_EXPIRED,
    title: "Your subscription has expired",
    message: `Your "${tierName}" subscription has expired. Your role was changed to "${downgradeRole}".`,
    metadata: { tierName, downgradeRole }
  };
}

// src/plex.ts
var HEADERS_BASE = {
  "X-Plex-Client-Identifier": "oscarr-plugin-subscription",
  "X-Plex-Product": "Oscarr",
  "X-Plex-Version": "1.0.0"
};
function sharesUrl(machineId) {
  return "https://plex.tv/api/servers/" + encodeURIComponent(machineId) + "/shared_servers";
}
function shareUrl(machineId, shareId) {
  return sharesUrl(machineId) + "/" + encodeURIComponent(String(shareId));
}
async function fetchPlexShares(token, machineId) {
  const res = await fetch(sharesUrl(machineId), {
    headers: { ...HEADERS_BASE, "X-Plex-Token": token, Accept: "application/xml" }
  });
  if (!res.ok) throw new Error("Plex shared_servers GET failed: " + res.status);
  const xml = await res.text();
  const out = [];
  const seen = /* @__PURE__ */ new Set();
  const regex = /<SharedServer\s[^>]*?>/g;
  let match;
  while ((match = regex.exec(xml)) !== null) {
    const tag = match[0];
    const attr = (name) => {
      const m = tag.match(new RegExp(name + '="([^"]*)"'));
      return m ? m[1] : "";
    };
    const plexUserId = parseInt(attr("userID"), 10);
    const shareId = parseInt(attr("id"), 10);
    if (!plexUserId || !shareId || seen.has(plexUserId)) continue;
    seen.add(plexUserId);
    out.push({ plexUserId, shareId });
  }
  return out;
}
async function resolvePlexOps(ctx) {
  const serviceConfig = await ctx.getServiceConfigRaw("plex");
  const token = typeof serviceConfig?.token === "string" ? serviceConfig.token : null;
  const appSettings = await ctx.getAppSettings();
  let machineId = typeof appSettings.plexMachineId === "string" ? appSettings.plexMachineId : null;
  if (!machineId && typeof serviceConfig?.machineId === "string") {
    machineId = serviceConfig.machineId;
  }
  if (!token || !machineId) return null;
  return { token, machineId };
}
async function unsharePlexUser(ctx, userId, ops) {
  const providers = await ctx.getUserProviders(userId);
  const plexLink = providers.find((p) => p.provider === "plex");
  if (!plexLink?.providerId) {
    ctx.log.info("[Subscription] Plex unshare skipped \u2014 user " + userId + " has no linked Plex account");
    return false;
  }
  const targetPlexId = parseInt(plexLink.providerId, 10);
  if (!Number.isFinite(targetPlexId)) {
    ctx.log.warn("[Subscription] Plex unshare skipped \u2014 user " + userId + " providerId is not a number: " + plexLink.providerId);
    return false;
  }
  const shares = await fetchPlexShares(ops.token, ops.machineId);
  const match = shares.find((s) => s.plexUserId === targetPlexId);
  if (!match) {
    ctx.log.info("[Subscription] Plex unshare skipped \u2014 user " + userId + " (plex id " + targetPlexId + ") is not currently in shared_servers");
    return false;
  }
  if (!match.shareId) {
    ctx.log.warn("[Subscription] Plex unshare aborted \u2014 found share for user " + userId + " but Plex response had no share id attribute");
    return false;
  }
  const del = await fetch(shareUrl(ops.machineId, match.shareId), {
    method: "DELETE",
    headers: { ...HEADERS_BASE, "X-Plex-Token": ops.token }
  });
  if (!del.ok) throw new Error("Plex shared_servers DELETE failed: " + del.status);
  return true;
}

// src/jobs.ts
var DAY_MS2 = 864e5;
async function runSubscriptionCheck(ctx, store) {
  const settings = await getSettings(ctx);
  const now = /* @__PURE__ */ new Date();
  const noticeThreshold = new Date(now.getTime() + settings.notifyDaysBefore * DAY_MS2);
  let expired = 0;
  let notified = 0;
  let kicked = 0;
  let errors = 0;
  const plexOpsPromise = settings.autoKickPlex ? resolvePlexOps(ctx) : Promise.resolve(null);
  const plexOps = await plexOpsPromise;
  if (settings.autoKickPlex && !plexOps) {
    ctx.log.warn("[Subscription] autoKickPlex is enabled but Plex service config (token/machineId) is missing \u2014 auto-kick pass will be skipped");
  }
  await store.mutate(async (data) => {
    for (const [userIdStr, sub] of Object.entries(data.subscriptions)) {
      const userId = Number(userIdStr);
      const expiresAt = new Date(sub.expiresAt);
      const tier = data.tiers.find((t) => t.id === sub.tierId);
      const tierName = tier?.name ?? "unknown";
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
          const daysLeft = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / DAY_MS2));
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
        const kickDueAt = new Date(sub.expiresAt).getTime() + settings.autoKickDelayDays * DAY_MS2;
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

// src/index.ts
var __dirname = dirname(fileURLToPath(import.meta.url));
var manifestPath = join2(__dirname, "..", "manifest.json");
async function register(ctx) {
  const manifest = JSON.parse(await readFile2(manifestPath, "utf-8"));
  for (const perm of PERMISSIONS) {
    ctx.registerPluginPermission(perm.key, perm.description);
  }
  const store = new SubscriptionStore(ctx);
  await store.load();
  const registerRoutes = async (app) => {
    await registerSubscriptionRoutes(app, ctx, store);
  };
  return {
    manifest,
    async registerRoutes(app) {
      await registerRoutes(app, ctx);
    },
    registerJobs() {
      return {
        subscription_check: async () => {
          return runSubscriptionCheck(ctx, store);
        }
      };
    }
  };
}
export {
  register
};
//# sourceMappingURL=index.js.map
