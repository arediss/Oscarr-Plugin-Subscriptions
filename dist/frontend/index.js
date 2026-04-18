// frontend/index.tsx
import { useState as useState4 } from "react";

// node_modules/lucide-react/dist/esm/createLucideIcon.js
import { forwardRef as forwardRef2, createElement as createElement3 } from "react";

// node_modules/lucide-react/dist/esm/shared/src/utils/mergeClasses.js
var mergeClasses = (...classes) => classes.filter((className, index, array) => {
  return Boolean(className) && className.trim() !== "" && array.indexOf(className) === index;
}).join(" ").trim();

// node_modules/lucide-react/dist/esm/shared/src/utils/toKebabCase.js
var toKebabCase = (string) => string.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// node_modules/lucide-react/dist/esm/shared/src/utils/toCamelCase.js
var toCamelCase = (string) => string.replace(
  /^([A-Z])|[\s-_]+(\w)/g,
  (match, p1, p2) => p2 ? p2.toUpperCase() : p1.toLowerCase()
);

// node_modules/lucide-react/dist/esm/shared/src/utils/toPascalCase.js
var toPascalCase = (string) => {
  const camelCase = toCamelCase(string);
  return camelCase.charAt(0).toUpperCase() + camelCase.slice(1);
};

// node_modules/lucide-react/dist/esm/Icon.js
import { forwardRef, createElement as createElement2 } from "react";

// node_modules/lucide-react/dist/esm/defaultAttributes.js
var defaultAttributes = {
  xmlns: "http://www.w3.org/2000/svg",
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round"
};

// node_modules/lucide-react/dist/esm/shared/src/utils/hasA11yProp.js
var hasA11yProp = (props) => {
  for (const prop in props) {
    if (prop.startsWith("aria-") || prop === "role" || prop === "title") {
      return true;
    }
  }
  return false;
};

// node_modules/lucide-react/dist/esm/context.js
import { createContext, useContext, useMemo, createElement } from "react";
var LucideContext = createContext({});
var useLucideContext = () => useContext(LucideContext);

// node_modules/lucide-react/dist/esm/Icon.js
var Icon = forwardRef(
  ({ color, size, strokeWidth, absoluteStrokeWidth, className = "", children, iconNode, ...rest }, ref) => {
    const {
      size: contextSize = 24,
      strokeWidth: contextStrokeWidth = 2,
      absoluteStrokeWidth: contextAbsoluteStrokeWidth = false,
      color: contextColor = "currentColor",
      className: contextClass = ""
    } = useLucideContext() ?? {};
    const calculatedStrokeWidth = absoluteStrokeWidth ?? contextAbsoluteStrokeWidth ? Number(strokeWidth ?? contextStrokeWidth) * 24 / Number(size ?? contextSize) : strokeWidth ?? contextStrokeWidth;
    return createElement2(
      "svg",
      {
        ref,
        ...defaultAttributes,
        width: size ?? contextSize ?? defaultAttributes.width,
        height: size ?? contextSize ?? defaultAttributes.height,
        stroke: color ?? contextColor,
        strokeWidth: calculatedStrokeWidth,
        className: mergeClasses("lucide", contextClass, className),
        ...!children && !hasA11yProp(rest) && { "aria-hidden": "true" },
        ...rest
      },
      [
        ...iconNode.map(([tag, attrs]) => createElement2(tag, attrs)),
        ...Array.isArray(children) ? children : [children]
      ]
    );
  }
);

// node_modules/lucide-react/dist/esm/createLucideIcon.js
var createLucideIcon = (iconName, iconNode) => {
  const Component = forwardRef2(
    ({ className, ...props }, ref) => createElement3(Icon, {
      ref,
      iconNode,
      className: mergeClasses(
        `lucide-${toKebabCase(toPascalCase(iconName))}`,
        `lucide-${iconName}`,
        className
      ),
      ...props
    })
  );
  Component.displayName = toPascalCase(iconName);
  return Component;
};

// node_modules/lucide-react/dist/esm/icons/check.js
var __iconNode = [["path", { d: "M20 6 9 17l-5-5", key: "1gmf2c" }]];
var Check = createLucideIcon("check", __iconNode);

// node_modules/lucide-react/dist/esm/icons/clock.js
var __iconNode2 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 6v6l4 2", key: "mmk7yg" }]
];
var Clock = createLucideIcon("clock", __iconNode2);

// node_modules/lucide-react/dist/esm/icons/coins.js
var __iconNode3 = [
  ["path", { d: "M13.744 17.736a6 6 0 1 1-7.48-7.48", key: "bq4yh3" }],
  ["path", { d: "M15 6h1v4", key: "11y1tn" }],
  ["path", { d: "m6.134 14.768.866-.5 2 3.464", key: "17snzx" }],
  ["circle", { cx: "16", cy: "8", r: "6", key: "14bfc9" }]
];
var Coins = createLucideIcon("coins", __iconNode3);

// node_modules/lucide-react/dist/esm/icons/pencil.js
var __iconNode4 = [
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ],
  ["path", { d: "m15 5 4 4", key: "1mk7zo" }]
];
var Pencil = createLucideIcon("pencil", __iconNode4);

// node_modules/lucide-react/dist/esm/icons/plus.js
var __iconNode5 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
var Plus = createLucideIcon("plus", __iconNode5);

// node_modules/lucide-react/dist/esm/icons/settings.js
var __iconNode6 = [
  [
    "path",
    {
      d: "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",
      key: "1i5ecw"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
var Settings = createLucideIcon("settings", __iconNode6);

// node_modules/lucide-react/dist/esm/icons/trash-2.js
var __iconNode7 = [
  ["path", { d: "M10 11v6", key: "nco0om" }],
  ["path", { d: "M14 11v6", key: "outv1u" }],
  ["path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6", key: "miytrc" }],
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2", key: "e791ji" }]
];
var Trash2 = createLucideIcon("trash-2", __iconNode7);

// node_modules/lucide-react/dist/esm/icons/triangle-alert.js
var __iconNode8 = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
var TriangleAlert = createLucideIcon("triangle-alert", __iconNode8);

// node_modules/lucide-react/dist/esm/icons/user-x.js
var __iconNode9 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }],
  ["line", { x1: "17", x2: "22", y1: "8", y2: "13", key: "3nzzx3" }],
  ["line", { x1: "22", x2: "17", y1: "8", y2: "13", key: "1swrse" }]
];
var UserX = createLucideIcon("user-x", __iconNode9);

// node_modules/lucide-react/dist/esm/icons/users.js
var __iconNode10 = [
  ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", key: "1yyitq" }],
  ["path", { d: "M16 3.128a4 4 0 0 1 0 7.744", key: "16gr8j" }],
  ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87", key: "kshegd" }],
  ["circle", { cx: "9", cy: "7", r: "4", key: "nufk8" }]
];
var Users = createLucideIcon("users", __iconNode10);

// node_modules/lucide-react/dist/esm/icons/x.js
var __iconNode11 = [
  ["path", { d: "M18 6 6 18", key: "1bl5f8" }],
  ["path", { d: "m6 6 12 12", key: "d8bk6v" }]
];
var X = createLucideIcon("x", __iconNode11);

// frontend/admin/TiersTab.tsx
import { useEffect, useState } from "react";

// frontend/api.ts
var BASE = "/api/plugins/subscription";
async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : void 0,
    body: body ? JSON.stringify(body) : void 0
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
    }
    throw new Error(message);
  }
  if (res.status === 204) return void 0;
  return await res.json();
}
async function fetchRoles() {
  const res = await fetch("/api/admin/roles", { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load roles (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.roles ?? [];
}
var api = {
  listTiers: () => request("GET", "/tiers"),
  createTier: (payload) => request("POST", "/tiers", payload),
  updateTier: (id, patch) => request("PUT", `/tiers/${id}`, patch),
  deleteTier: (id) => request("DELETE", `/tiers/${id}`),
  listSubscriptions: () => request("GET", "/subscriptions"),
  upsertSubscription: (payload) => request("POST", "/subscriptions", payload),
  revokeSubscription: (userId) => request("DELETE", `/subscriptions/${userId}`),
  me: () => request("GET", "/me")
};

// frontend/ConfirmModal.tsx
import { jsx, jsxs } from "react/jsx-runtime";
var CONFIRM_BUTTON = {
  danger: "btn-danger",
  warning: "btn-warning",
  primary: "btn-primary"
};
function ConfirmModal({
  open,
  title,
  message,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  busy = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in",
      onClick: () => !busy && onCancel(),
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          className: "card w-full max-w-sm mx-4 p-6 shadow-2xl",
          onClick: (e) => e.stopPropagation(),
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
              /* @__PURE__ */ jsx("h3", { className: "text-base font-bold text-ndp-text", children: title }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => !busy && onCancel(),
                  className: "p-1 -mt-1 -mr-1 rounded-lg text-ndp-text-dim hover:text-ndp-text hover:bg-white/5 transition-colors flex-shrink-0",
                  "aria-label": "Close",
                  children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" })
                }
              )
            ] }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-ndp-text-muted mt-2", children: message }),
            description && /* @__PURE__ */ jsx("p", { className: "text-xs text-ndp-text-dim mt-2", children: description }),
            /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-6", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => !busy && onCancel(),
                  disabled: busy,
                  className: "btn-secondary text-sm disabled:opacity-50",
                  children: cancelLabel
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: onConfirm,
                  disabled: busy,
                  className: `${CONFIRM_BUTTON[variant]} text-sm disabled:opacity-50`,
                  children: busy ? "Please wait\u2026" : confirmLabel
                }
              )
            ] })
          ]
        }
      )
    }
  );
}

// frontend/admin/TiersTab.tsx
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function TiersTab() {
  const [tiers, setTiers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const refresh = async () => {
    setLoading(true);
    try {
      const [tiersResult, rolesResult] = await Promise.all([api.listTiers(), fetchRoles()]);
      setTiers(tiersResult.tiers);
      setRoles(rolesResult.filter((r) => r.name !== "admin"));
      setError(null);
    } catch (err) {
      setError(String(err.message));
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
    if (!name || typeof durationDays !== "number" || durationDays <= 0 || !priceLabel || !roleName) {
      setError("Name, duration (>0), price label and role are required");
      return;
    }
    setSaving(true);
    try {
      if (editing.mode === "create") {
        await api.createTier({ name, description, durationDays, priceLabel, roleName });
      } else if (editing.tier.id) {
        await api.updateTier(editing.tier.id, { name, description, durationDays, priceLabel, roleName });
      }
      setEditing(null);
      setError(null);
      await refresh();
    } catch (err) {
      setError(String(err.message));
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
      setError(String(err.message));
    } finally {
      setDeleting(null);
    }
  };
  return /* @__PURE__ */ jsxs2("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between gap-4 flex-wrap", children: [
      /* @__PURE__ */ jsxs2("div", { children: [
        /* @__PURE__ */ jsx2("h2", { className: "text-lg font-semibold text-ndp-text", children: "Subscription tiers" }),
        /* @__PURE__ */ jsx2("p", { className: "text-xs text-ndp-text-dim mt-0.5", children: "Define the plans you want to offer. Prices are display-only \u2014 no payment is processed." })
      ] }),
      /* @__PURE__ */ jsxs2(
        "button",
        {
          onClick: () => setEditing({ mode: "create", tier: { durationDays: 30 } }),
          className: "btn-primary text-sm flex items-center gap-2",
          children: [
            /* @__PURE__ */ jsx2(Plus, { className: "w-4 h-4" }),
            "New tier"
          ]
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-3 px-4 py-2.5 bg-ndp-danger/10 border border-ndp-danger/30 rounded-xl text-sm text-ndp-danger animate-fade-in", children: [
      /* @__PURE__ */ jsx2(TriangleAlert, { className: "w-4 h-4 flex-shrink-0" }),
      /* @__PURE__ */ jsx2("span", { children: error })
    ] }),
    loading ? /* @__PURE__ */ jsx2("div", { className: "space-y-3", children: [0, 1, 2].map((i) => /* @__PURE__ */ jsxs2("div", { className: "card p-4", children: [
      /* @__PURE__ */ jsx2("div", { className: "skeleton h-5 w-40 rounded" }),
      /* @__PURE__ */ jsx2("div", { className: "skeleton h-3 w-64 mt-2 rounded" })
    ] }, i)) }) : tiers.length === 0 ? /* @__PURE__ */ jsxs2("div", { className: "card p-8 text-center", children: [
      /* @__PURE__ */ jsx2(Coins, { className: "w-10 h-10 text-ndp-text-dim mx-auto mb-3" }),
      /* @__PURE__ */ jsx2("p", { className: "text-sm text-ndp-text-muted", children: "No tiers yet." }),
      /* @__PURE__ */ jsx2("p", { className: "text-xs text-ndp-text-dim mt-1", children: "Create one to start assigning subscriptions." })
    ] }) : /* @__PURE__ */ jsx2("div", { className: "space-y-3", children: tiers.map((t) => /* @__PURE__ */ jsx2("div", { className: "card", children: /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-4 p-4", children: [
      /* @__PURE__ */ jsxs2("div", { className: "flex-1 min-w-0", children: [
        /* @__PURE__ */ jsx2("div", { className: "text-sm font-semibold text-ndp-text truncate", children: t.name }),
        t.description && /* @__PURE__ */ jsx2("div", { className: "text-xs text-ndp-text-dim mt-0.5 truncate", children: t.description })
      ] }),
      /* @__PURE__ */ jsxs2("div", { className: "flex items-center gap-3 flex-shrink-0", children: [
        /* @__PURE__ */ jsx2("span", { className: "text-[10px] px-2 py-0.5 rounded-full font-medium bg-ndp-accent/10 text-ndp-accent", children: t.roleName || "\u2014" }),
        /* @__PURE__ */ jsx2("span", { className: "h-5 w-px bg-white/10", "aria-hidden": true }),
        /* @__PURE__ */ jsxs2("span", { className: "text-xs text-ndp-text-dim tabular-nums", children: [
          t.durationDays,
          " days"
        ] }),
        /* @__PURE__ */ jsx2("span", { className: "h-5 w-px bg-white/10", "aria-hidden": true }),
        /* @__PURE__ */ jsx2("span", { className: "text-xs text-ndp-text-muted font-medium tabular-nums", children: t.priceLabel }),
        /* @__PURE__ */ jsx2("span", { className: "h-5 w-px bg-white/10", "aria-hidden": true }),
        /* @__PURE__ */ jsx2(
          "button",
          {
            onClick: () => setEditing({ mode: "edit", tier: { ...t } }),
            className: "p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-accent hover:bg-white/5 transition-colors",
            title: "Edit",
            children: /* @__PURE__ */ jsx2(Pencil, { className: "w-3.5 h-3.5" })
          }
        ),
        /* @__PURE__ */ jsx2(
          "button",
          {
            onClick: () => setDeleteConfirm(t),
            disabled: deleting === t.id,
            className: "p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-danger hover:bg-ndp-danger/10 transition-colors disabled:opacity-30",
            title: "Delete",
            children: /* @__PURE__ */ jsx2(Trash2, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }) }, t.id)) }),
    editing && /* @__PURE__ */ jsx2(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in",
        onClick: () => !saving && setEditing(null),
        children: /* @__PURE__ */ jsxs2("div", { className: "card w-full max-w-md mx-4 p-6 shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxs2("div", { className: "flex items-center justify-between mb-5", children: [
            /* @__PURE__ */ jsx2("h3", { className: "text-lg font-bold text-ndp-text", children: editing.mode === "create" ? "New tier" : "Edit tier" }),
            /* @__PURE__ */ jsx2(
              "button",
              {
                onClick: () => !saving && setEditing(null),
                className: "p-1 rounded-lg text-ndp-text-dim hover:text-ndp-text hover:bg-white/5 transition-colors",
                children: /* @__PURE__ */ jsx2(X, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs2("label", { className: "block space-y-1.5", children: [
              /* @__PURE__ */ jsx2("span", { className: "text-xs font-medium text-ndp-text-muted", children: "Name" }),
              /* @__PURE__ */ jsx2(
                "input",
                {
                  className: "input w-full",
                  placeholder: "Monthly",
                  value: editing.tier.name ?? "",
                  onChange: (e) => setEditing({ ...editing, tier: { ...editing.tier, name: e.target.value } }),
                  autoFocus: true
                }
              )
            ] }),
            /* @__PURE__ */ jsxs2("div", { className: "grid grid-cols-2 gap-3", children: [
              /* @__PURE__ */ jsxs2("label", { className: "block space-y-1.5", children: [
                /* @__PURE__ */ jsx2("span", { className: "text-xs font-medium text-ndp-text-muted", children: "Duration (days)" }),
                /* @__PURE__ */ jsx2(
                  "input",
                  {
                    type: "number",
                    min: 1,
                    className: "input w-full tabular-nums",
                    value: editing.tier.durationDays ?? 0,
                    onChange: (e) => setEditing({ ...editing, tier: { ...editing.tier, durationDays: Number(e.target.value) } })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs2("label", { className: "block space-y-1.5", children: [
                /* @__PURE__ */ jsx2("span", { className: "text-xs font-medium text-ndp-text-muted", children: "Price label" }),
                /* @__PURE__ */ jsx2(
                  "input",
                  {
                    className: "input w-full",
                    placeholder: "9.99\u20AC/month",
                    value: editing.tier.priceLabel ?? "",
                    onChange: (e) => setEditing({ ...editing, tier: { ...editing.tier, priceLabel: e.target.value } })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs2("label", { className: "block space-y-1.5", children: [
              /* @__PURE__ */ jsxs2("span", { className: "text-xs font-medium text-ndp-text-muted", children: [
                "Role assigned on active subscription",
                /* @__PURE__ */ jsx2("span", { className: "text-ndp-danger ml-1", children: "*" })
              ] }),
              /* @__PURE__ */ jsxs2(
                "select",
                {
                  className: "input w-full",
                  value: editing.tier.roleName ?? "",
                  onChange: (e) => setEditing({ ...editing, tier: { ...editing.tier, roleName: e.target.value } }),
                  children: [
                    /* @__PURE__ */ jsx2("option", { value: "", children: "\u2014 Select a role \u2014" }),
                    roles.map((r) => /* @__PURE__ */ jsx2("option", { value: r.name, children: r.name }, r.name))
                  ]
                }
              ),
              roles.length === 0 && /* @__PURE__ */ jsx2("span", { className: "text-xs text-ndp-warning", children: "No roles found \u2014 create one in Admin \u2192 Roles first." })
            ] }),
            /* @__PURE__ */ jsxs2("label", { className: "block space-y-1.5", children: [
              /* @__PURE__ */ jsx2("span", { className: "text-xs font-medium text-ndp-text-muted", children: "Description (optional)" }),
              /* @__PURE__ */ jsx2(
                "textarea",
                {
                  className: "input w-full resize-none",
                  rows: 3,
                  placeholder: "What's included in this tier\u2026",
                  value: editing.tier.description ?? "",
                  onChange: (e) => setEditing({ ...editing, tier: { ...editing.tier, description: e.target.value } })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs2("div", { className: "flex justify-end gap-2 mt-6", children: [
            /* @__PURE__ */ jsx2(
              "button",
              {
                onClick: () => setEditing(null),
                disabled: saving,
                className: "btn-secondary text-sm disabled:opacity-50",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx2(
              "button",
              {
                onClick: save,
                disabled: saving,
                className: "btn-primary text-sm disabled:opacity-50",
                children: saving ? "Saving\u2026" : "Save"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx2(
      ConfirmModal,
      {
        open: !!deleteConfirm,
        title: "Delete tier?",
        message: `Permanently remove the "${deleteConfirm?.name}" tier.`,
        description: "Active subscriptions using this tier must be revoked first \u2014 the delete will fail otherwise.",
        confirmLabel: "Delete",
        variant: "danger",
        busy: deleting === deleteConfirm?.id,
        onConfirm: confirmDelete,
        onCancel: () => setDeleteConfirm(null)
      }
    )
  ] });
}

// frontend/admin/UsersTab.tsx
import { useEffect as useEffect2, useMemo as useMemo2, useState as useState2 } from "react";
import { Fragment, jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
async function fetchServices() {
  const res = await fetch("/api/admin/services", { credentials: "include" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
async function unsharePlex(userId) {
  const res = await fetch(`/api/admin/plex/shared/${userId}`, {
    method: "DELETE",
    credentials: "include"
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Unshare failed (${res.status})`);
  }
}
async function fetchUsers() {
  const res = await fetch("/api/admin/users", { credentials: "include" });
  if (!res.ok) throw new Error(`Users list failed: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.users ?? [];
}
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(void 0, { year: "numeric", month: "2-digit", day: "2-digit" });
}
function statusFor(sub) {
  if (!sub) return { label: "No subscription", tone: "bg-white/5 text-ndp-text-dim" };
  const remaining = new Date(sub.expiresAt).getTime() - Date.now();
  if (sub.expiredAt || remaining <= 0) return { label: "Expired", tone: "bg-ndp-danger/10 text-ndp-danger" };
  if (remaining < 7 * 864e5) return { label: "Expiring soon", tone: "bg-ndp-warning/10 text-ndp-warning" };
  return { label: "Active", tone: "bg-ndp-success/10 text-ndp-success" };
}
function UsersTab() {
  const [users, setUsers] = useState2([]);
  const [subs, setSubs] = useState2({});
  const [tiers, setTiers] = useState2([]);
  const [plexAvailable, setPlexAvailable] = useState2(false);
  const [unsharing, setUnsharing] = useState2(null);
  const [loading, setLoading] = useState2(true);
  const [error, setError] = useState2(null);
  const [assigning, setAssigning] = useState2(null);
  const [saving, setSaving] = useState2(false);
  const [revoking, setRevoking] = useState2(null);
  const [revokeConfirm, setRevokeConfirm] = useState2(null);
  const [unshareConfirm, setUnshareConfirm] = useState2(null);
  const tiersById = useMemo2(() => {
    const map = /* @__PURE__ */ new Map();
    tiers.forEach((t) => map.set(t.id, t));
    return map;
  }, [tiers]);
  const refresh = async () => {
    setLoading(true);
    try {
      const [usersData, subsData, services] = await Promise.all([
        fetchUsers(),
        api.listSubscriptions(),
        fetchServices()
      ]);
      setUsers(usersData);
      setSubs(subsData.subscriptions);
      setTiers(subsData.tiers);
      setPlexAvailable(services.some((s) => s.type === "plex" && s.enabled));
      setError(null);
    } catch (err) {
      setError(String(err.message));
    } finally {
      setLoading(false);
    }
  };
  useEffect2(() => {
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
      setError(String(err.message));
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
        startedAt: assigning.startedAt || void 0
      });
      setAssigning(null);
      await refresh();
    } catch (err) {
      setError(String(err.message));
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
      setError(String(err.message));
    } finally {
      setRevoking(null);
    }
  };
  const sortedUsers = useMemo2(() => {
    const weight = (u) => {
      const sub = subs[String(u.id)];
      if (!sub) return 3;
      const remaining = new Date(sub.expiresAt).getTime() - Date.now();
      if (sub.expiredAt || remaining <= 0) return 2;
      if (remaining < 7 * 864e5) return 0;
      return 1;
    };
    return [...users].sort((a, b) => weight(a) - weight(b));
  }, [users, subs]);
  return /* @__PURE__ */ jsxs3("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs3("div", { children: [
      /* @__PURE__ */ jsx3("h2", { className: "text-lg font-semibold text-ndp-text", children: "User subscriptions" }),
      /* @__PURE__ */ jsx3("p", { className: "text-xs text-ndp-text-dim mt-0.5", children: "Assign a tier to a user. Their role changes immediately; the cron runs daily at 03:00 to handle expirations." })
    ] }),
    error && /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 px-4 py-2.5 bg-ndp-danger/10 border border-ndp-danger/30 rounded-xl text-sm text-ndp-danger animate-fade-in", children: [
      /* @__PURE__ */ jsx3(TriangleAlert, { className: "w-4 h-4 flex-shrink-0" }),
      /* @__PURE__ */ jsx3("span", { children: error })
    ] }),
    tiers.length === 0 && !loading && /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 px-4 py-2.5 bg-ndp-warning/10 border border-ndp-warning/30 rounded-xl text-sm text-ndp-warning", children: [
      /* @__PURE__ */ jsx3(TriangleAlert, { className: "w-4 h-4 flex-shrink-0" }),
      /* @__PURE__ */ jsx3("span", { children: "No tiers defined \u2014 create one in the Tiers sub-tab before assigning subscriptions." })
    ] }),
    loading ? /* @__PURE__ */ jsx3("div", { className: "space-y-3", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxs3("div", { className: "card p-4 flex items-center gap-4", children: [
      /* @__PURE__ */ jsx3("div", { className: "skeleton w-10 h-10 rounded-full" }),
      /* @__PURE__ */ jsxs3("div", { className: "flex-1 space-y-2", children: [
        /* @__PURE__ */ jsx3("div", { className: "skeleton h-4 w-48 rounded" }),
        /* @__PURE__ */ jsx3("div", { className: "skeleton h-3 w-64 rounded" })
      ] })
    ] }, i)) }) : /* @__PURE__ */ jsx3("div", { className: "space-y-3", children: sortedUsers.map((u) => {
      const sub = subs[String(u.id)] ?? null;
      const tier = sub ? tiersById.get(sub.tierId) ?? null : null;
      const status = statusFor(sub);
      const subExpired = !!sub && (!!sub.expiredAt || new Date(sub.expiresAt).getTime() <= Date.now());
      const hasPlex = u.providers?.some((p) => p.provider === "plex") ?? false;
      const canUnsharePlex = subExpired && plexAvailable && hasPlex;
      return /* @__PURE__ */ jsx3("div", { className: "card", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-4 p-4", children: [
        u.avatar ? /* @__PURE__ */ jsx3("img", { src: u.avatar, alt: "", className: "w-10 h-10 rounded-full flex-shrink-0" }) : /* @__PURE__ */ jsx3("div", { className: "w-10 h-10 rounded-full bg-ndp-accent/20 flex items-center justify-center text-ndp-accent font-bold flex-shrink-0", children: (u.displayName || u.email)[0].toUpperCase() }),
        /* @__PURE__ */ jsxs3("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx3("div", { className: "text-sm font-semibold text-ndp-text truncate", children: u.displayName || u.email }),
          /* @__PURE__ */ jsxs3("div", { className: "text-xs text-ndp-text-dim mt-0.5 truncate", children: [
            u.email,
            " \xB7 ",
            u.role
          ] })
        ] }),
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 flex-shrink-0", children: [
          /* @__PURE__ */ jsx3("span", { className: `text-[10px] px-2 py-0.5 rounded-full font-medium ${status.tone}`, children: status.label }),
          sub && tier && /* @__PURE__ */ jsxs3(Fragment, { children: [
            /* @__PURE__ */ jsx3("span", { className: "h-5 w-px bg-white/10", "aria-hidden": true }),
            /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 text-xs", children: [
              /* @__PURE__ */ jsx3("span", { className: "font-medium text-ndp-text", children: tier.name }),
              /* @__PURE__ */ jsxs3("span", { className: "flex items-center gap-1 text-ndp-text-dim tabular-nums", children: [
                /* @__PURE__ */ jsx3(Clock, { className: "w-3 h-3" }),
                /* @__PURE__ */ jsx3("span", { className: "text-ndp-text-dim", children: "until" }),
                /* @__PURE__ */ jsx3("span", { className: "text-ndp-text-muted", children: formatDate(sub.expiresAt) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx3("span", { className: "h-5 w-px bg-white/10", "aria-hidden": true }),
          /* @__PURE__ */ jsx3(
            "button",
            {
              disabled: tiers.length === 0,
              onClick: () => setAssigning({
                user: u,
                tierId: sub?.tierId ?? tiers[0]?.id ?? "",
                startedAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
              }),
              className: "p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-accent hover:bg-white/5 transition-colors disabled:opacity-30",
              title: sub ? "Change tier" : "Assign tier",
              children: /* @__PURE__ */ jsx3(Pencil, { className: "w-3.5 h-3.5" })
            }
          ),
          canUnsharePlex && /* @__PURE__ */ jsx3(
            "button",
            {
              onClick: () => setUnshareConfirm(u),
              disabled: unsharing === u.id,
              className: "p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-warning hover:bg-ndp-warning/10 transition-colors disabled:opacity-30",
              title: "Unlink this user from Plex library",
              children: /* @__PURE__ */ jsx3(UserX, { className: "w-3.5 h-3.5" })
            }
          ),
          sub && /* @__PURE__ */ jsx3(
            "button",
            {
              onClick: () => setRevokeConfirm(u),
              disabled: revoking === u.id,
              className: "p-1.5 rounded-lg text-ndp-text-dim hover:text-ndp-danger hover:bg-ndp-danger/10 transition-colors disabled:opacity-30",
              title: "Revoke subscription",
              children: /* @__PURE__ */ jsx3(Trash2, { className: "w-3.5 h-3.5" })
            }
          )
        ] })
      ] }) }, u.id);
    }) }),
    assigning && /* @__PURE__ */ jsx3(
      "div",
      {
        className: "fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in",
        onClick: () => !saving && setAssigning(null),
        children: /* @__PURE__ */ jsxs3("div", { className: "card w-full max-w-md mx-4 p-6 shadow-2xl", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between mb-5", children: [
            /* @__PURE__ */ jsxs3("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx3("h3", { className: "text-lg font-bold text-ndp-text truncate", children: assigning.user.displayName || assigning.user.email }),
              /* @__PURE__ */ jsx3("p", { className: "text-xs text-ndp-text-dim truncate", children: assigning.user.email })
            ] }),
            /* @__PURE__ */ jsx3(
              "button",
              {
                onClick: () => !saving && setAssigning(null),
                className: "p-1 rounded-lg text-ndp-text-dim hover:text-ndp-text hover:bg-white/5 transition-colors flex-shrink-0",
                children: /* @__PURE__ */ jsx3(X, { className: "w-4 h-4" })
              }
            )
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs3("label", { className: "block space-y-1.5", children: [
              /* @__PURE__ */ jsx3("span", { className: "text-xs font-medium text-ndp-text-muted", children: "Tier" }),
              /* @__PURE__ */ jsx3(
                "select",
                {
                  className: "input w-full",
                  value: assigning.tierId,
                  onChange: (e) => setAssigning({ ...assigning, tierId: e.target.value }),
                  children: tiers.map((t) => /* @__PURE__ */ jsxs3("option", { value: t.id, children: [
                    t.name,
                    " \xB7 ",
                    t.durationDays,
                    " days \xB7 ",
                    t.priceLabel
                  ] }, t.id))
                }
              )
            ] }),
            /* @__PURE__ */ jsxs3("label", { className: "block space-y-1.5", children: [
              /* @__PURE__ */ jsx3("span", { className: "text-xs font-medium text-ndp-text-muted", children: "Start date" }),
              /* @__PURE__ */ jsx3(
                "input",
                {
                  type: "date",
                  className: "input w-full tabular-nums",
                  value: assigning.startedAt,
                  onChange: (e) => setAssigning({ ...assigning, startedAt: e.target.value })
                }
              )
            ] }),
            (() => {
              const tier = tiersById.get(assigning.tierId);
              const start = new Date(assigning.startedAt);
              if (!tier || Number.isNaN(start.getTime())) return null;
              const expires = new Date(start.getTime() + tier.durationDays * 864e5);
              return /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 px-3 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs text-ndp-text-muted", children: [
                /* @__PURE__ */ jsx3(Clock, { className: "w-3.5 h-3.5 text-ndp-text-dim flex-shrink-0" }),
                /* @__PURE__ */ jsxs3("span", { children: [
                  "Will expire on",
                  " ",
                  /* @__PURE__ */ jsx3("span", { className: "font-medium text-ndp-text tabular-nums", children: formatDate(expires.toISOString()) }),
                  /* @__PURE__ */ jsxs3("span", { className: "text-ndp-text-dim", children: [
                    " (",
                    tier.durationDays,
                    " days)"
                  ] })
                ] })
              ] });
            })()
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "flex justify-end gap-2 mt-6", children: [
            /* @__PURE__ */ jsx3(
              "button",
              {
                onClick: () => setAssigning(null),
                disabled: saving,
                className: "btn-secondary text-sm disabled:opacity-50",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx3(
              "button",
              {
                onClick: saveAssignment,
                disabled: saving || !assigning.tierId,
                className: "btn-primary text-sm disabled:opacity-50 flex items-center gap-2",
                children: saving ? "Saving\u2026" : /* @__PURE__ */ jsxs3(Fragment, { children: [
                  /* @__PURE__ */ jsx3(Check, { className: "w-4 h-4" }),
                  "Save"
                ] })
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsx3(
      ConfirmModal,
      {
        open: !!revokeConfirm,
        title: "Revoke subscription?",
        message: `Remove the subscription for ${revokeConfirm?.displayName || revokeConfirm?.email}.`,
        description: "The user keeps their current role until you change it manually. Plex access is not affected.",
        confirmLabel: "Revoke",
        variant: "danger",
        busy: revoking === revokeConfirm?.id,
        onConfirm: confirmRevoke,
        onCancel: () => setRevokeConfirm(null)
      }
    ),
    /* @__PURE__ */ jsx3(
      ConfirmModal,
      {
        open: !!unshareConfirm,
        title: "Unlink from Plex?",
        message: `Remove Plex library access for ${unshareConfirm?.displayName || unshareConfirm?.email}.`,
        description: "The user will immediately lose access to your shared Plex libraries. Their Oscarr account and subscription are not touched.",
        confirmLabel: "Unlink",
        variant: "warning",
        busy: unsharing === unshareConfirm?.id,
        onConfirm: confirmUnsharePlex,
        onCancel: () => setUnshareConfirm(null)
      }
    )
  ] });
}

// frontend/admin/SettingsTab.tsx
import { useEffect as useEffect3, useState as useState3 } from "react";
import { Fragment as Fragment2, jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
var ROLE_KEYS = /* @__PURE__ */ new Set(["downgradeRoleName"]);
async function fetchSettings() {
  const res = await fetch("/api/plugins/subscription/settings", { credentials: "include" });
  if (!res.ok) throw new Error(`Failed to load settings (${res.status})`);
  return await res.json();
}
async function saveSettings(values) {
  const res = await fetch("/api/plugins/subscription/settings", {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Save failed (${res.status})`);
  }
}
function SettingsTab() {
  const [schema, setSchema] = useState3([]);
  const [values, setValues] = useState3({});
  const [roles, setRoles] = useState3([]);
  const [loading, setLoading] = useState3(true);
  const [saving, setSaving] = useState3(false);
  const [saved, setSaved] = useState3(false);
  const [error, setError] = useState3(null);
  useEffect3(() => {
    (async () => {
      try {
        const [data, rolesResult] = await Promise.all([fetchSettings(), fetchRoles()]);
        setSchema(data.schema);
        const merged = {};
        for (const field of data.schema) {
          const saved2 = data.values?.[field.key];
          merged[field.key] = saved2 !== void 0 && saved2 !== null && saved2 !== "" ? saved2 : field.default;
        }
        setValues(merged);
        setRoles(rolesResult.filter((r) => r.name !== "admin"));
      } catch (err) {
        setError(String(err.message));
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const update = (key, value) => {
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
      setError(String(err.message));
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx4("div", { className: "space-y-3", children: [0, 1, 2, 3].map((i) => /* @__PURE__ */ jsxs4("div", { className: "card p-4 space-y-2", children: [
      /* @__PURE__ */ jsx4("div", { className: "skeleton h-3 w-32 rounded" }),
      /* @__PURE__ */ jsx4("div", { className: "skeleton h-10 w-full rounded" })
    ] }, i)) });
  }
  return /* @__PURE__ */ jsxs4("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs4("div", { children: [
      /* @__PURE__ */ jsx4("h2", { className: "text-lg font-semibold text-ndp-text", children: "Settings" }),
      /* @__PURE__ */ jsx4("p", { className: "text-xs text-ndp-text-dim mt-0.5", children: "Configure which role is assigned on an active subscription, which role replaces it on expiration, and when users are notified." })
    ] }),
    error && /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3 px-4 py-2.5 bg-ndp-danger/10 border border-ndp-danger/30 rounded-xl text-sm text-ndp-danger animate-fade-in", children: [
      /* @__PURE__ */ jsx4(TriangleAlert, { className: "w-4 h-4 flex-shrink-0" }),
      /* @__PURE__ */ jsx4("span", { children: error })
    ] }),
    /* @__PURE__ */ jsx4("div", { className: "card p-6 space-y-5", children: schema.map((field) => {
      const v = values[field.key] ?? field.default ?? (field.type === "boolean" ? false : "");
      if (field.type === "boolean") {
        return /* @__PURE__ */ jsxs4("div", { className: "flex items-center justify-between gap-4", children: [
          /* @__PURE__ */ jsx4("label", { className: "text-sm font-medium text-ndp-text", children: field.label }),
          /* @__PURE__ */ jsx4(
            "button",
            {
              type: "button",
              onClick: () => update(field.key, !v),
              className: `relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${v ? "bg-ndp-accent" : "bg-white/10"}`,
              children: /* @__PURE__ */ jsx4(
                "span",
                {
                  className: `absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${v ? "translate-x-5" : ""}`
                }
              )
            }
          )
        ] }, field.key);
      }
      if (ROLE_KEYS.has(field.key)) {
        return /* @__PURE__ */ jsxs4("label", { className: "block space-y-1.5", children: [
          /* @__PURE__ */ jsxs4("span", { className: "text-sm font-medium text-ndp-text", children: [
            field.label,
            field.required && /* @__PURE__ */ jsx4("span", { className: "text-ndp-danger ml-1", children: "*" })
          ] }),
          /* @__PURE__ */ jsxs4(
            "select",
            {
              className: "input w-full",
              value: v ?? "",
              onChange: (e) => update(field.key, e.target.value),
              children: [
                /* @__PURE__ */ jsx4("option", { value: "", children: "\u2014 Select a role \u2014" }),
                roles.map((r) => /* @__PURE__ */ jsx4("option", { value: r.name, children: r.name }, r.name))
              ]
            }
          ),
          roles.length === 0 && /* @__PURE__ */ jsx4("span", { className: "text-xs text-ndp-warning", children: "No roles found \u2014 create one in Admin \u2192 Roles first." })
        ] }, field.key);
      }
      return /* @__PURE__ */ jsxs4("label", { className: "block space-y-1.5", children: [
        /* @__PURE__ */ jsxs4("span", { className: "text-sm font-medium text-ndp-text", children: [
          field.label,
          field.required && /* @__PURE__ */ jsx4("span", { className: "text-ndp-danger ml-1", children: "*" })
        ] }),
        /* @__PURE__ */ jsx4(
          "input",
          {
            type: field.type === "password" ? "password" : field.type === "number" ? "number" : "text",
            className: "input w-full tabular-nums",
            value: v ?? "",
            onChange: (e) => update(field.key, field.type === "number" ? Number(e.target.value) : e.target.value)
          }
        )
      ] }, field.key);
    }) }),
    /* @__PURE__ */ jsxs4("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsx4(
        "button",
        {
          onClick: save,
          disabled: saving,
          className: "btn-primary text-sm flex items-center gap-2 disabled:opacity-50",
          children: saving ? "Saving\u2026" : /* @__PURE__ */ jsxs4(Fragment2, { children: [
            /* @__PURE__ */ jsx4(Check, { className: "w-4 h-4" }),
            "Save"
          ] })
        }
      ),
      saved && /* @__PURE__ */ jsxs4("span", { className: "text-xs text-ndp-success flex items-center gap-1.5 animate-fade-in", children: [
        /* @__PURE__ */ jsx4(Check, { className: "w-3.5 h-3.5" }),
        "Saved"
      ] })
    ] })
  ] });
}

// frontend/index.tsx
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
var TABS = [
  { id: "tiers", label: "Tiers", Icon: Coins },
  { id: "users", label: "Users", Icon: Users },
  { id: "settings", label: "Settings", Icon: Settings }
];
function getInitialTab() {
  const hash = window.location.hash.replace("#", "");
  if (TABS.some((t) => t.id === hash)) return hash;
  return "tiers";
}
function SubscriptionAdmin() {
  const [activeTab, setActiveTab] = useState4(getInitialTab);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };
  return /* @__PURE__ */ jsxs5("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx5("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxs5("div", { children: [
      /* @__PURE__ */ jsx5("h1", { className: "text-2xl font-bold text-ndp-text", children: "Subscriptions" }),
      /* @__PURE__ */ jsx5("p", { className: "text-xs text-ndp-text-dim", children: "Tiers, user assignments, automatic role changes and notifications." })
    ] }) }),
    /* @__PURE__ */ jsx5("div", { className: "flex gap-2 overflow-x-auto pb-1", style: { scrollbarWidth: "none" }, children: TABS.map(({ id, label, Icon: Icon2 }) => /* @__PURE__ */ jsxs5(
      "button",
      {
        onClick: () => handleTabChange(id),
        className: "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap " + (activeTab === id ? "bg-ndp-accent text-white" : "bg-ndp-surface text-ndp-text-muted hover:bg-ndp-surface-light"),
        children: [
          /* @__PURE__ */ jsx5(Icon2, { className: "w-4 h-4" }),
          label
        ]
      },
      id
    )) }),
    /* @__PURE__ */ jsxs5("div", { className: "animate-fade-in", children: [
      activeTab === "tiers" && /* @__PURE__ */ jsx5(TiersTab, {}),
      activeTab === "users" && /* @__PURE__ */ jsx5(UsersTab, {}),
      activeTab === "settings" && /* @__PURE__ */ jsx5(SettingsTab, {})
    ] }, activeTab)
  ] });
}
export {
  SubscriptionAdmin as default
};
/*! Bundled license information:

lucide-react/dist/esm/shared/src/utils/mergeClasses.js:
lucide-react/dist/esm/shared/src/utils/toKebabCase.js:
lucide-react/dist/esm/shared/src/utils/toCamelCase.js:
lucide-react/dist/esm/shared/src/utils/toPascalCase.js:
lucide-react/dist/esm/defaultAttributes.js:
lucide-react/dist/esm/shared/src/utils/hasA11yProp.js:
lucide-react/dist/esm/context.js:
lucide-react/dist/esm/Icon.js:
lucide-react/dist/esm/createLucideIcon.js:
lucide-react/dist/esm/icons/check.js:
lucide-react/dist/esm/icons/clock.js:
lucide-react/dist/esm/icons/coins.js:
lucide-react/dist/esm/icons/pencil.js:
lucide-react/dist/esm/icons/plus.js:
lucide-react/dist/esm/icons/settings.js:
lucide-react/dist/esm/icons/trash-2.js:
lucide-react/dist/esm/icons/triangle-alert.js:
lucide-react/dist/esm/icons/user-x.js:
lucide-react/dist/esm/icons/users.js:
lucide-react/dist/esm/icons/x.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=index.js.map
