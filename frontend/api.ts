const BASE = '/api/plugins/subscription';

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { 'X-Requested-With': 'oscarr' };
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch { /* ignore */ }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export interface Tier {
  id: string;
  name: string;
  description?: string;
  durationDays: number;
  priceLabel: string;
  roleName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  name: string;
}

export async function fetchRoles(): Promise<Role[]> {
  const res = await fetch('/api/admin/roles', {
    credentials: 'include',
    headers: { 'X-Requested-With': 'oscarr' },
  });
  if (!res.ok) throw new Error(`Failed to load roles (${res.status})`);
  const data = (await res.json()) as Role[] | { roles?: Role[] };
  return Array.isArray(data) ? data : data.roles ?? [];
}

export interface Subscription {
  tierId: string;
  startedAt: string;
  expiresAt: string;
  notifiedAt: string | null;
  expiredAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  listTiers: () => request<{ tiers: Tier[] }>('GET', '/tiers'),
  createTier: (payload: Pick<Tier, 'name' | 'description' | 'durationDays' | 'priceLabel' | 'roleName'>) =>
    request<{ tier: Tier }>('POST', '/tiers', payload),
  updateTier: (id: string, patch: Partial<Pick<Tier, 'name' | 'description' | 'durationDays' | 'priceLabel' | 'roleName'>>) =>
    request<{ tier: Tier }>('PUT', `/tiers/${id}`, patch),
  deleteTier: (id: string) => request<{ ok: true }>('DELETE', `/tiers/${id}`),

  listSubscriptions: () =>
    request<{ subscriptions: Record<string, Subscription>; tiers: Tier[] }>('GET', '/subscriptions'),
  upsertSubscription: (payload: { userId: number; tierId: string; startedAt?: string }) =>
    request<{ subscription: Subscription }>('POST', '/subscriptions', payload),
  revokeSubscription: (userId: number) => request<{ ok: true }>('DELETE', `/subscriptions/${userId}`),

  me: () => request<{ subscription: Subscription | null; tier: Tier | null }>('GET', '/me'),
};
