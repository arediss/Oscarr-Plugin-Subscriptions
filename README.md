# Oscarr Plugin — Subscriptions

A self-hosted-friendly subscription tracker for [Oscarr](https://github.com/arediss/Oscarr). Defines subscription tiers, assigns them to users, promotes their RBAC role on activation, sends notifications before and at expiration, and optionally kicks them from your Plex library after a configurable grace period.

No payment processing. No external SaaS. All data lives in a single JSON file under the Oscarr data directory — delete the plugin folder and nothing remains in the core DB beyond a single `PluginState` row.

## Features

- **Tiers** — name, duration (days), price label (display only), optional description, role assigned on activation.
- **User subscriptions** — one active subscription per user, admin-assigned, admin-revocable.
- **Role lifecycle** — user's role is set to the tier's role on assignment, set to the configured downgrade role on expiration.
- **Notifications** — pre-expiry notice at `J-N` days (configurable), expiration notice on the expiry day.
- **Plex auto-kick** — optional. After `N` days past expiration, removes the user from Plex `shared_servers` and disables their Oscarr account.
- **Manual unlink** — admin button next to the revoke button, appears only when the sub is expired and Plex is configured and the user has a linked Plex account.
- **Admin UI** — three sub-tabs (Tiers, Users, Settings) under the Oscarr admin panel.
- **Avatar menu entry** — end users see their tier and expiration date in the Oscarr user dropdown.

## Requirements

- **Oscarr core** with plugin API `v1` exposing these ctx methods: `log`, `getUser`, `getUserProviders`, `setUserRole`, `setUserDisabled`, `getSetting`, `setSetting`, `getAppSettings`, `getServiceConfigRaw`, `getPluginDataDir`, `sendUserNotification`, `registerPluginPermission`, `registerRoutePermission`.
- **Node 20+** with native `fetch` and ESM support.
- For Plex auto-kick / manual unlink: a Plex service configured in Oscarr (token + machineId).

### Core endpoints consumed by the frontend

The plugin's admin UI calls these Oscarr core endpoints in addition to its own `/api/plugins/subscription/*` routes:

| Endpoint | Purpose |
|---|---|
| `GET /api/admin/roles` | List available RBAC roles when creating or editing a tier. |
| `GET /api/admin/users` | List all Oscarr users to assign subscriptions to. |
| `GET /api/admin/services` | Detect whether Plex is configured (toggles the manual unlink button). |
| `DELETE /api/admin/plex/shared/:userId` | Core-side Plex unshare used by the manual unlink button. |
| `GET /api/plugins/subscription/settings` | Served by the Oscarr core plugin-settings handler (not registered by this plugin). |
| `PUT /api/plugins/subscription/settings` | Same — core serves reads and writes of plugin settings via this path. |

## Install

1. Clone anywhere you like:
   ```bash
   git clone https://github.com/arediss/Oscarr-Plugin-Subscriptions.git
   cd Oscarr-Plugin-Subscriptions
   npm install
   npm run build
   ```

2. Symlink (or copy) the folder into your Oscarr instance's plugins directory:
   ```bash
   ln -s /absolute/path/to/Oscarr-Plugin-Subscriptions /absolute/path/to/oscarr/packages/plugins/subscription
   ```

3. Restart the Oscarr backend — the loader discovers the new plugin and mounts its routes at `/api/plugins/subscription`.

4. Visit **Admin → Plugins**, confirm the plugin is enabled.

5. Visit **Admin → Subscriptions → Settings** and pick:
   - `downgradeRoleName` — role users fall back to when their sub expires (usually `user`).
   - `notifyDaysBefore` — days before expiration to send the pre-expiry notification (default `7`).
   - `notifyOnExpiration` — also send a notification on the expiration day (default `true`).
   - `autoKickPlex` — enable the auto-kick feature (default `false`).
   - `autoKickDelayDays` — grace period after expiration before auto-kick (default `3`).

## Data & uninstall

All domain data is stored at `<oscarr>/packages/backend/data/plugins/subscription/data.json`. Settings live in the core `PluginState.settings` JSON blob (written by the core plugin-settings handler).

To uninstall:
1. Remove the symlink from `packages/plugins/`.
2. Restart the Oscarr backend.
3. Optional: delete `<oscarr>/packages/backend/data/plugins/subscription/` to drop historical data, and delete the `PluginState` row for `subscription` to drop settings.

Nothing else is persisted — no Prisma tables, no schema migrations to roll back.

## Data model

`data.json`:

```jsonc
{
  "version": 1,
  "tiers": [
    {
      "id": "tier_xxxx",
      "name": "Premium",
      "description": "Full library access",
      "durationDays": 30,
      "priceLabel": "9.99€/month",
      "roleName": "premium",
      "createdAt": "2026-04-16T12:00:00.000Z",
      "updatedAt": "2026-04-16T12:00:00.000Z"
    }
  ],
  "subscriptions": {
    "42": {
      "tierId": "tier_xxxx",
      "startedAt": "2026-04-16T00:00:00.000Z",
      "expiresAt": "2026-05-16T00:00:00.000Z",
      "notifiedAt": null,
      "expiredAt": null,
      "plexKickedAt": null,
      "createdAt": "2026-04-16T12:00:00.000Z",
      "updatedAt": "2026-04-16T12:00:00.000Z"
    }
  }
}
```

Writes are serialized in-memory and persisted via `tmp` + `rename()` so a crash mid-write cannot leave a truncated file. A corrupted `data.json` is renamed to `data.json.corrupt-<ts>` on the next load and the store is reinitialized empty (with a loud log).

## Cron

A single job named `subscription_check` is declared in `manifest.json` and runs daily at `03:00` **in the server's local timezone**. Override via the Oscarr admin Jobs UI if needed. The job runs three passes in order:

1. Subscriptions with `expiresAt <= now` and `expiredAt IS NULL` → stamp `expiredAt`, call `setUserRole(user, downgradeRoleName)`, optionally send the "expired" notification.
2. Subscriptions with `expiresAt` within `notifyDaysBefore` and `notifiedAt IS NULL` → send the pre-expiry notification, stamp `notifiedAt`.
3. If `autoKickPlex` is on and the Plex token + machineId are resolvable, subscriptions with `expiresAt + autoKickDelayDays <= now` and `plexKickedAt IS NULL` → unshare from Plex (logging a miss if the user is not in `shared_servers`), stamp `plexKickedAt`, call `setUserDisabled(user, true)`.

## Permissions

Declared via `ctx.registerPluginPermission`:

| Permission | Scope |
|---|---|
| `subscription.tiers.manage` | Create / edit / delete tiers. |
| `subscription.subs.manage` | Assign / revoke / list all user subscriptions. |

`/api/plugins/subscription/me` inherits the default `/api/plugins/*` rule (any authenticated user can read their own subscription).

## Known limitations

- User-facing notification copy is English-only. The plugin does not currently plug into the Oscarr i18n system.
- The cron fires once a day; expiration granularity is therefore 24 hours at worst.
- `priceLabel` is a free-form string — no currency awareness, no payment processing.
- Plex auto-kick currently only works for servers where the Plex token and machineId are present in the `plex` service config. Plex accounts known only via user-linked OAuth tokens are not currently used as a fallback.
- History is not retained — renewing a user's subscription overwrites the previous row.

## Development

```bash
npm install
npm run dev   # esbuild watch mode
```

Sources in `src/` (backend) and `frontend/` (admin UI + avatar hook). `npm run build` produces `dist/index.js` for the backend entry, `dist/frontend/index.js` for the admin tab, and `dist/frontend/hooks/avatar.menu.js` for the avatar dropdown entry.

## License

MIT.
