// frontend/hooks/avatar.menu.tsx
import { useEffect, useState } from "react";

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

// node_modules/lucide-react/dist/esm/icons/coins.js
var __iconNode = [
  ["path", { d: "M13.744 17.736a6 6 0 1 1-7.48-7.48", key: "bq4yh3" }],
  ["path", { d: "M15 6h1v4", key: "11y1tn" }],
  ["path", { d: "m6.134 14.768.866-.5 2 3.464", key: "17snzx" }],
  ["circle", { cx: "16", cy: "8", r: "6", key: "14bfc9" }]
];
var Coins = createLucideIcon("coins", __iconNode);

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

// frontend/hooks/avatar.menu.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(void 0, { year: "numeric", month: "2-digit", day: "2-digit" });
}
function SubscriptionAvatarEntry({ context }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    const userId = context?.user?.id;
    if (!userId) return;
    let cancelled = false;
    api.me().then(({ subscription, tier: tier2 }) => {
      if (!cancelled) setState({ sub: subscription, tier: tier2 });
    }).catch(() => {
      if (!cancelled) setState({ sub: null, tier: null });
    });
    return () => {
      cancelled = true;
    };
  }, [context?.user?.id]);
  if (!state) return null;
  const { sub, tier } = state;
  if (!sub || !tier) {
    return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-4 py-2.5 text-sm text-ndp-text-dim border-t border-white/5", children: [
      /* @__PURE__ */ jsx(Coins, { className: "w-4 h-4 flex-shrink-0" }),
      /* @__PURE__ */ jsx("span", { className: "truncate", children: "No subscription" })
    ] });
  }
  const expired = !!sub.expiredAt || new Date(sub.expiresAt).getTime() <= Date.now();
  const primaryTone = expired ? "text-ndp-danger" : "text-ndp-text";
  const secondaryTone = expired ? "text-ndp-danger/70" : "text-ndp-text-dim";
  const primaryLabel = tier.name;
  const secondaryLabel = expired ? `expired ${formatDate(sub.expiresAt)}` : `until ${formatDate(sub.expiresAt)}`;
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2.5 px-4 py-2.5 border-t border-white/5", children: [
    /* @__PURE__ */ jsx(Coins, { className: `w-4 h-4 flex-shrink-0 ${expired ? "text-ndp-danger" : "text-ndp-text-muted"}` }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsx("div", { className: `text-sm font-medium truncate ${primaryTone}`, children: primaryLabel }),
      /* @__PURE__ */ jsx("div", { className: `text-xs truncate ${secondaryTone}`, children: secondaryLabel })
    ] })
  ] });
}
export {
  SubscriptionAvatarEntry as default
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
lucide-react/dist/esm/icons/coins.js:
lucide-react/dist/esm/lucide-react.js:
  (**
   * @license lucide-react v1.8.0 - ISC
   *
   * This source code is licensed under the ISC license.
   * See the LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=avatar.menu.js.map
