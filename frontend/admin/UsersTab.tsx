import { useEffect, useMemo, useState } from 'react';
import { Trash2, X, AlertTriangle, Clock, Check, Pencil, UserX } from 'lucide-react';
import { api, type Subscription, type Tier } from '../api';
import { ConfirmModal } from '../ConfirmModal';

interface AdminUserProvider {
  provider: string;
  providerUsername?: string | null;
  providerEmail?: string | null;
}

interface AdminUser {
  id: number;
  email: string;
  displayName: string | null;
  role: string;
  avatar?: string | null;
  providers?: AdminUserProvider[];
}

interface ServiceInfo {
  type: string;
  enabled: boolean;
}

async function fetchServices(): Promise<ServiceInfo[]> {
  const res = await fetch('/api/admin/services', { credentials: 'include' });
  if (!res.ok) return [];
  const data = (await res.json()) as ServiceInfo[];
  return Array.isArray(data) ? data : [];
}

async function unsharePlex(userId: number): Promise<void> {
  const res = await fetch(`/api/admin/plex/shared/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Unshare failed (${res.status})`);
  }
}

interface AssignState {
  user: AdminUser;
  tierId: string;
  startedAt: string;
}

type Status =
  | { label: 'Active'; tone: 'bg-ndp-success/10 text-ndp-success' }
  | { label: 'Expiring soon'; tone: 'bg-ndp-warning/10 text-ndp-warning' }
  | { label: 'Expired'; tone: 'bg-ndp-danger/10 text-ndp-danger' }
  | { label: 'No subscription'; tone: 'bg-white/5 text-ndp-text-dim' };

async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch('/api/admin/users', { credentials: 'include' });
  if (!res.ok) throw new Error(`Users list failed: ${res.statusText}`);
  const data = (await res.json()) as { users?: AdminUser[] } | AdminUser[];
  return Array.isArray(data) ? data : data.users ?? [];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function statusFor(sub: Subscription | null): Status {
  if (!sub) return { label: 'No subscription', tone: 'bg-white/5 text-ndp-text-dim' };
  const remaining = new Date(sub.expiresAt).getTime() - Date.now();
  if (sub.expiredAt || remaining <= 0) return { label: 'Expired', tone: 'bg-ndp-danger/10 text-ndp-danger' };
  if (remaining < 7 * 86400000) return { label: 'Expiring soon', tone: 'bg-ndp-warning/10 text-ndp-warning' };
  return { label: 'Active', tone: 'bg-ndp-success/10 text-ndp-success' };
}

export function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [subs, setSubs] = useState<Record<string, Subscription>>({});
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [plexAvailable, setPlexAvailable] = useState(false);
  const [unsharing, setUnsharing] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assigning, setAssigning] = useState<AssignState | null>(null);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState<number | null>(null);
  const [revokeConfirm, setRevokeConfirm] = useState<AdminUser | null>(null);
  const [unshareConfirm, setUnshareConfirm] = useState<AdminUser | null>(null);

  const tiersById = useMemo(() => {
    const map = new Map<string, Tier>();
    tiers.forEach((t) => map.set(t.id, t));
    return map;
  }, [tiers]);

  const refresh = async () => {
    setLoading(true);
    try {
      const [usersData, subsData, services] = await Promise.all([
        fetchUsers(),
        api.listSubscriptions(),
        fetchServices(),
      ]);
      setUsers(usersData);
      setSubs(subsData.subscriptions);
      setTiers(subsData.tiers);
      setPlexAvailable(services.some((s) => s.type === 'plex' && s.enabled));
      setError(null);
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const confirmUnsharePlex = async () => {
    if (!unshareConfirm) return;
    const userId = unshareConfirm.id;
    setUnsharing(userId);
    try {
      await unsharePlex(userId);
      setUnshareConfirm(null);
      setError(null);
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setUnsharing(null);
    }
  };

  const saveAssignment = async () => {
    if (!assigning) return;
    setSaving(true);
    try {
      await api.upsertSubscription({
        userId: assigning.user.id,
        tierId: assigning.tierId,
        startedAt: assigning.startedAt || undefined,
      });
      setAssigning(null);
      await refresh();
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setSaving(false);
    }
  };

  const confirmRevoke = async () => {
    if (!revokeConfirm) return;
    const userId = revokeConfirm.id;
    setRevoking(userId);
    try {
      await api.revokeSubscription(userId);
      setRevokeConfirm(null);
      await refresh();
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setRevoking(null);
    }
  };

  const sortedUsers = useMemo(() => {
    const weight = (u: AdminUser) => {
      const sub = subs[String(u.id)];
      if (!sub) return 3;
      const remaining = new Date(sub.expiresAt).getTime() - Date.now();
      if (sub.expiredAt || remaining <= 0) return 2;
      if (remaining < 7 * 86400000) return 0;
      return 1;
    };
    return [...users].sort((a, b) => weight(a) - weight(b));
  }, [users, subs]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ndp-text">User subscriptions</h2>
        <p className="text-xs text-ndp-text-dim mt-0.5">
          Assign a tier to a user. Their role changes immediately; the cron runs daily at 03:00 to handle expirations.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-ndp-danger/10 border border-ndp-danger/30 rounded-xl text-sm text-ndp-danger animate-fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {tiers.length === 0 && !loading && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-ndp-warning/10 border border-ndp-warning/30 rounded-xl text-sm text-ndp-warning">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>No tiers defined — create one in the Tiers sub-tab before assigning subscriptions.</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="card p-4 flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-48 rounded" />
                <div className="skeleton h-3 w-64 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedUsers.map((u) => {
            const sub = subs[String(u.id)] ?? null;
            const tier = sub ? tiersById.get(sub.tierId) ?? null : null;
            const status = statusFor(sub);
            const subExpired = !!sub && (!!sub.expiredAt || new Date(sub.expiresAt).getTime() <= Date.now());
            const hasPlex = u.providers?.some((p) => p.provider === 'plex') ?? false;
            const canUnsharePlex = subExpired && plexAvailable && hasPlex;
            return (
              <div key={u.id} className="card">
                <div className="flex items-center gap-4 p-4">
                  {u.avatar ? (
                    <img src={u.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-ndp-accent/20 flex items-center justify-center text-ndp-accent font-bold flex-shrink-0">
                      {(u.displayName || u.email)[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ndp-text truncate">
                      {u.displayName || u.email}
                    </div>
                    <div className="text-xs text-ndp-text-dim mt-0.5 truncate">
                      {u.email} · {u.role}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${status.tone}`}>
                      {status.label}
                    </span>
                    {sub && tier && (
                      <>
                        <span className="h-5 w-px bg-white/10" aria-hidden />
                        <div className="flex items-center gap-3 text-xs">
                          <span className="font-medium text-ndp-text">{tier.name}</span>
                          <span className="flex items-center gap-1 text-ndp-text-dim tabular-nums">
                            <Clock className="w-3 h-3" />
                            <span className="text-ndp-text-dim">until</span>
                            <span className="text-ndp-text-muted">{formatDate(sub.expiresAt)}</span>
                          </span>
                        </div>
                      </>
                    )}
                    <span className="h-5 w-px bg-white/10" aria-hidden />
                    <button
                      disabled={tiers.length === 0}
                      onClick={() => setAssigning({
                        user: u,
                        tierId: sub?.tierId ?? tiers[0]?.id ?? '',
                        startedAt: new Date().toISOString().slice(0, 10),
                      })}
                      className="p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-accent hover:bg-white/5 transition-colors disabled:opacity-30"
                      title={sub ? 'Change tier' : 'Assign tier'}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    {canUnsharePlex && (
                      <button
                        onClick={() => setUnshareConfirm(u)}
                        disabled={unsharing === u.id}
                        className="p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-warning hover:bg-ndp-warning/10 transition-colors disabled:opacity-30"
                        title="Unlink this user from Plex library"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {sub && (
                      <button
                        onClick={() => setRevokeConfirm(u)}
                        disabled={revoking === u.id}
                        className="p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-danger hover:bg-ndp-danger/10 transition-colors disabled:opacity-30"
                        title="Revoke subscription"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {assigning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !saving && setAssigning(null)}
        >
          <div className="card w-full max-w-md mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-ndp-text truncate">
                  {assigning.user.displayName || assigning.user.email}
                </h3>
                <p className="text-xs text-ndp-text-dim truncate">{assigning.user.email}</p>
              </div>
              <button
                onClick={() => !saving && setAssigning(null)}
                className="p-1 rounded-lg text-ndp-text-dim hover:text-ndp-text hover:bg-white/5 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-ndp-text-muted">Tier</span>
                <select
                  className="input w-full"
                  value={assigning.tierId}
                  onChange={(e) => setAssigning({ ...assigning, tierId: e.target.value })}
                >
                  {tiers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} · {t.durationDays} days · {t.priceLabel}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-ndp-text-muted">Start date</span>
                <input
                  type="date"
                  className="input w-full tabular-nums"
                  value={assigning.startedAt}
                  onChange={(e) => setAssigning({ ...assigning, startedAt: e.target.value })}
                />
              </label>
              {(() => {
                const tier = tiersById.get(assigning.tierId);
                const start = new Date(assigning.startedAt);
                if (!tier || Number.isNaN(start.getTime())) return null;
                const expires = new Date(start.getTime() + tier.durationDays * 86400000);
                return (
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs text-ndp-text-muted">
                    <Clock className="w-3.5 h-3.5 text-ndp-text-dim flex-shrink-0" />
                    <span>
                      Will expire on{' '}
                      <span className="font-medium text-ndp-text tabular-nums">
                        {formatDate(expires.toISOString())}
                      </span>
                      <span className="text-ndp-text-dim"> ({tier.durationDays} days)</span>
                    </span>
                  </div>
                );
              })()}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setAssigning(null)}
                disabled={saving}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAssignment}
                disabled={saving || !assigning.tierId}
                className="btn-primary text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? 'Saving…' : (
                  <>
                    <Check className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!revokeConfirm}
        title="Revoke subscription?"
        message={`Remove the subscription for ${revokeConfirm?.displayName || revokeConfirm?.email}.`}
        description="The user keeps their current role until you change it manually. Plex access is not affected."
        confirmLabel="Revoke"
        variant="danger"
        busy={revoking === revokeConfirm?.id}
        onConfirm={confirmRevoke}
        onCancel={() => setRevokeConfirm(null)}
      />

      <ConfirmModal
        open={!!unshareConfirm}
        title="Unlink from Plex?"
        message={`Remove Plex library access for ${unshareConfirm?.displayName || unshareConfirm?.email}.`}
        description="The user will immediately lose access to your shared Plex libraries. Their Oscarr account and subscription are not touched."
        confirmLabel="Unlink"
        variant="warning"
        busy={unsharing === unshareConfirm?.id}
        onConfirm={confirmUnsharePlex}
        onCancel={() => setUnshareConfirm(null)}
      />
    </div>
  );
}
