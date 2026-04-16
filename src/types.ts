import type { FastifyInstance } from 'fastify';

export interface PluginLogger {
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
}

export interface PluginUser {
  id: number;
  email: string;
  displayName: string | null;
  role: string;
}

export interface PluginProviderLink {
  provider: string;
  providerId: string | null;
  providerUsername: string | null;
  providerEmail: string | null;
}

export interface PluginContext {
  log: PluginLogger;
  getUser(userId: number): Promise<PluginUser | null>;
  setUserRole(userId: number, roleName: string): Promise<void>;
  setUserDisabled(userId: number, disabled: boolean): Promise<void>;
  getPluginDataDir(): Promise<string>;
  getSetting(key: string): Promise<unknown>;
  setSetting(key: string, value: unknown): Promise<void>;
  sendUserNotification(
    userId: number,
    payload: { type: string; title: string; message: string; metadata?: Record<string, unknown> }
  ): Promise<void>;
  registerPluginPermission(permission: string, description?: string): void;
  registerRoutePermission(routeKey: string, rule: { permission: string; ownerScoped?: boolean }): void;
  getServiceConfigRaw(serviceType: string): Promise<Record<string, unknown> | null>;
  getAppSettings(): Promise<Record<string, unknown>>;
  getUserProviders(userId: number): Promise<PluginProviderLink[]>;
}

export interface SubscriptionTier {
  id: string;
  name: string;
  description?: string;
  durationDays: number;
  priceLabel: string;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSubscription {
  tierId: string;
  startedAt: string;
  expiresAt: string;
  notifiedAt: string | null;
  expiredAt: string | null;
  /** Set when the auto-kick pass has successfully unshared the user from Plex. Dedupes retry across cron runs. */
  plexKickedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionStoreData {
  version: number;
  tiers: SubscriptionTier[];
  subscriptions: Record<string, UserSubscription>;
}

export interface PluginSettings {
  downgradeRoleName: string;
  notifyDaysBefore: number;
  notifyOnExpiration: boolean;
  autoKickPlex: boolean;
  autoKickDelayDays: number;
}

export type RegisterRoutes = (app: FastifyInstance, ctx: PluginContext) => Promise<void> | void;
