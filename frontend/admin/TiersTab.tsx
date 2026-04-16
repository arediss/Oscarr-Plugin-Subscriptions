import { useEffect, useState } from 'react';
import { Pencil, Trash2, Plus, X, Coins, AlertTriangle } from 'lucide-react';
import { api, fetchRoles, type Role, type Tier } from '../api';
import { ConfirmModal } from '../ConfirmModal';

interface EditState {
  mode: 'create' | 'edit';
  tier: Partial<Tier>;
}

export function TiersTab() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Tier | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [tiersResult, rolesResult] = await Promise.all([api.listTiers(), fetchRoles()]);
      setTiers(tiersResult.tiers);
      setRoles(rolesResult.filter((r) => r.name !== 'admin'));
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

  const save = async () => {
    if (!editing) return;
    const { name, description, durationDays, priceLabel, roleName } = editing.tier;
    if (!name || typeof durationDays !== 'number' || durationDays <= 0 || !priceLabel || !roleName) {
      setError('Name, duration (>0), price label and role are required');
      return;
    }
    setSaving(true);
    try {
      if (editing.mode === 'create') {
        await api.createTier({ name, description, durationDays, priceLabel, roleName });
      } else if (editing.tier.id) {
        await api.updateTier(editing.tier.id, { name, description, durationDays, priceLabel, roleName });
      }
      setEditing(null);
      setError(null);
      await refresh();
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const id = deleteConfirm.id;
    setDeleting(id);
    try {
      await api.deleteTier(id);
      setDeleteConfirm(null);
      await refresh();
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-ndp-text">Subscription tiers</h2>
          <p className="text-xs text-ndp-text-dim mt-0.5">
            Define the plans you want to offer. Prices are display-only — no payment is processed.
          </p>
        </div>
        <button
          onClick={() => setEditing({ mode: 'create', tier: { durationDays: 30 } })}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New tier
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-ndp-danger/10 border border-ndp-danger/30 rounded-xl text-sm text-ndp-danger animate-fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="card p-4">
              <div className="skeleton h-5 w-40 rounded" />
              <div className="skeleton h-3 w-64 mt-2 rounded" />
            </div>
          ))}
        </div>
      ) : tiers.length === 0 ? (
        <div className="card p-8 text-center">
          <Coins className="w-10 h-10 text-ndp-text-dim mx-auto mb-3" />
          <p className="text-sm text-ndp-text-muted">No tiers yet.</p>
          <p className="text-xs text-ndp-text-dim mt-1">Create one to start assigning subscriptions.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tiers.map((t) => (
            <div key={t.id} className="card">
              <div className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-ndp-text truncate">{t.name}</div>
                  {t.description && (
                    <div className="text-xs text-ndp-text-dim mt-0.5 truncate">{t.description}</div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-ndp-accent/10 text-ndp-accent">
                    {t.roleName || '—'}
                  </span>
                  <span className="h-5 w-px bg-white/10" aria-hidden />
                  <span className="text-xs text-ndp-text-dim tabular-nums">{t.durationDays} days</span>
                  <span className="h-5 w-px bg-white/10" aria-hidden />
                  <span className="text-xs text-ndp-text-muted font-medium tabular-nums">{t.priceLabel}</span>
                  <span className="h-5 w-px bg-white/10" aria-hidden />
                  <button
                    onClick={() => setEditing({ mode: 'edit', tier: { ...t } })}
                    className="p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-accent hover:bg-white/5 transition-colors"
                    title="Edit"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(t)}
                    disabled={deleting === t.id}
                    className="p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-danger hover:bg-ndp-danger/10 transition-colors disabled:opacity-30"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => !saving && setEditing(null)}
        >
          <div className="card w-full max-w-md mx-4 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ndp-text">
                {editing.mode === 'create' ? 'New tier' : 'Edit tier'}
              </h3>
              <button
                onClick={() => !saving && setEditing(null)}
                className="p-1 rounded-lg text-ndp-text-dim hover:text-ndp-text hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-ndp-text-muted">Name</span>
                <input
                  className="input w-full"
                  placeholder="Monthly"
                  value={editing.tier.name ?? ''}
                  onChange={(e) => setEditing({ ...editing, tier: { ...editing.tier, name: e.target.value } })}
                  autoFocus
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ndp-text-muted">Duration (days)</span>
                  <input
                    type="number"
                    min={1}
                    className="input w-full tabular-nums"
                    value={editing.tier.durationDays ?? 0}
                    onChange={(e) => setEditing({ ...editing, tier: { ...editing.tier, durationDays: Number(e.target.value) } })}
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-xs font-medium text-ndp-text-muted">Price label</span>
                  <input
                    className="input w-full"
                    placeholder="9.99€/month"
                    value={editing.tier.priceLabel ?? ''}
                    onChange={(e) => setEditing({ ...editing, tier: { ...editing.tier, priceLabel: e.target.value } })}
                  />
                </label>
              </div>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-ndp-text-muted">
                  Role assigned on active subscription
                  <span className="text-ndp-danger ml-1">*</span>
                </span>
                <select
                  className="input w-full"
                  value={editing.tier.roleName ?? ''}
                  onChange={(e) => setEditing({ ...editing, tier: { ...editing.tier, roleName: e.target.value } })}
                >
                  <option value="">— Select a role —</option>
                  {roles.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
                {roles.length === 0 && (
                  <span className="text-xs text-ndp-warning">No roles found — create one in Admin → Roles first.</span>
                )}
              </label>
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-ndp-text-muted">Description (optional)</span>
                <textarea
                  className="input w-full resize-none"
                  rows={3}
                  placeholder="What's included in this tier…"
                  value={editing.tier.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, tier: { ...editing.tier, description: e.target.value } })}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEditing(null)}
                disabled={saving}
                className="btn-secondary text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete tier?"
        message={`Permanently remove the "${deleteConfirm?.name}" tier.`}
        description="Active subscriptions using this tier must be revoked first — the delete will fail otherwise."
        confirmLabel="Delete"
        variant="danger"
        busy={deleting === deleteConfirm?.id}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
