import { useEffect, useState } from 'react';
import { AlertTriangle, Check } from 'lucide-react';
import { fetchRoles, type Role } from '../api';

interface SettingDef {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'password';
  required?: boolean;
  default?: unknown;
}

interface SettingsPayload {
  schema: SettingDef[];
  values: Record<string, unknown>;
}

const ROLE_KEYS = new Set(['downgradeRoleName']);

async function fetchSettings(): Promise<SettingsPayload> {
  const res = await fetch('/api/plugins/subscription/settings', { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed to load settings (${res.status})`);
  return (await res.json()) as SettingsPayload;
}

async function saveSettings(values: Record<string, unknown>): Promise<void> {
  const res = await fetch('/api/plugins/subscription/settings', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(err.error || `Save failed (${res.status})`);
  }
}

export function SettingsTab() {
  const [schema, setSchema] = useState<SettingDef[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [data, rolesResult] = await Promise.all([fetchSettings(), fetchRoles()]);
        setSchema(data.schema);
        const merged: Record<string, unknown> = {};
        for (const field of data.schema) {
          const saved = data.values?.[field.key];
          merged[field.key] = saved !== undefined && saved !== null && saved !== ''
            ? saved
            : field.default;
        }
        setValues(merged);
        setRoles(rolesResult.filter((r) => r.name !== 'admin'));
      } catch (err) {
        setError(String((err as Error).message));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (key: string, value: unknown) => {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveSettings(values);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(String((err as Error).message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="card p-4 space-y-2">
            <div className="skeleton h-3 w-32 rounded" />
            <div className="skeleton h-10 w-full rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-ndp-text">Settings</h2>
        <p className="text-xs text-ndp-text-dim mt-0.5">
          Configure which role is assigned on an active subscription, which role replaces it on expiration,
          and when users are notified.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-ndp-danger/10 border border-ndp-danger/30 rounded-xl text-sm text-ndp-danger animate-fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="card p-6 space-y-5">
        {schema.map((field) => {
          const v = values[field.key] ?? field.default ?? (field.type === 'boolean' ? false : '');
          if (field.type === 'boolean') {
            return (
              <div key={field.key} className="flex items-center justify-between gap-4">
                <label className="text-sm font-medium text-ndp-text">{field.label}</label>
                <button
                  type="button"
                  onClick={() => update(field.key, !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${v ? 'bg-ndp-accent' : 'bg-white/10'}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${v ? 'translate-x-5' : ''}`}
                  />
                </button>
              </div>
            );
          }
          if (ROLE_KEYS.has(field.key)) {
            return (
              <label key={field.key} className="block space-y-1.5">
                <span className="text-sm font-medium text-ndp-text">
                  {field.label}
                  {field.required && <span className="text-ndp-danger ml-1">*</span>}
                </span>
                <select
                  className="input w-full"
                  value={(v as string) ?? ''}
                  onChange={(e) => update(field.key, e.target.value)}
                >
                  <option value="">— Select a role —</option>
                  {roles.map((r) => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
                {roles.length === 0 && (
                  <span className="text-xs text-ndp-warning">
                    No roles found — create one in Admin → Roles first.
                  </span>
                )}
              </label>
            );
          }
          return (
            <label key={field.key} className="block space-y-1.5">
              <span className="text-sm font-medium text-ndp-text">
                {field.label}
                {field.required && <span className="text-ndp-danger ml-1">*</span>}
              </span>
              <input
                type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                className="input w-full tabular-nums"
                value={(v as string | number) ?? ''}
                onChange={(e) =>
                  update(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)
                }
              />
            </label>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={saving}
          className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving…' : (
            <>
              <Check className="w-4 h-4" />
              Save
            </>
          )}
        </button>
        {saved && (
          <span className="text-xs text-ndp-success flex items-center gap-1.5 animate-fade-in">
            <Check className="w-3.5 h-3.5" />
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
