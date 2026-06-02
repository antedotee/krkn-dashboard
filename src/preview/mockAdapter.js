// Custom axios adapter for the static PR preview.
//
// When VITE_PREVIEW_MODE=true we replace axiosInstance's transport with this
// adapter, so every API call resolves locally from seed fixtures instead of
// hitting a (non-existent) backend. No service worker, so it works on any
// GitHub Pages sub-path. Production builds never import this file.

import * as seed from "./seedData";

// Resolve the request path regardless of how axios composed the URL.
const pathOf = (config) => {
  let url = config.url || "";
  try {
    if (/^https?:\/\//i.test(url)) url = new URL(url).pathname;
  } catch {
    /* keep url as-is */
  }
  const base = config.baseURL || "";
  if (base && url.startsWith(base)) url = url.slice(base.length);
  const q = url.indexOf("?");
  if (q >= 0) url = url.slice(0, q);
  if (!url.startsWith("/")) url = `/${url}`;
  return url;
};

// A route is [method, RegExp, handler]. handler returns the response body, or a
// { blob: true, data } wrapper for file downloads.
const routes = [
  // --- auth ---
  ["get", /^\/auth\/me$/, () => ({ user: seed.seedUser })],
  ["patch", /^\/auth\/me$/, () => ({ user: seed.seedUser })],
  ["post", /^\/auth\/login$/, () => ({ user: seed.seedUser })],
  ["post", /^\/auth\/logout$/, () => ({ ok: true })],
  ["post", /^\/auth\/change-password$/, () => ({ user: seed.seedUser })],
  ["get", /^\/auth\/groups\/mine$/, () => ({ groups: seed.seedGroups })],
  ["get", /^\/auth\/groups$/, () => ({ groups: seed.seedGroups })],
  [
    "get",
    /^\/auth\/groups\/(\d+)$/,
    (_c, m) => ({
      group: seed.seedGroups.find((g) => String(g.id) === m[1]) || seed.seedGroups[0],
    }),
  ],
  ["get", /^\/auth\/users$/, () => ({ users: seed.seedUsers })],
  ["get", /^\/auth\/kubeconfigs$/, () => ({ kubeconfigs: seed.seedKubeconfigs })],
  ["get", /^\/auth\/audit$/, () => ({ entries: [] })],
  ["get", /^\/auth\/initial-login-hint$/, () => ({ hint: null })],
  // group/user/kubeconfig mutations: just acknowledge.
  ["post", /^\/auth\/groups(\/.*)?$/, () => ({ ok: true })],
  ["put", /^\/auth\/.*/, () => ({ ok: true })],
  ["patch", /^\/auth\/.*/, () => ({ ok: true })],
  ["delete", /^\/auth\/.*/, () => ({ ok: true })],

  // --- experiments / podman ---
  ["get", /^\/getPodmanStatus$/, () => ({ status: "success" })],
  ["get", /^\/removePod$/, () => "200"],
  [
    "post",
    /^\/start-kraken$/,
    () => ({ status: "200", message: "3f9a8b7c6d5e4a2b1c0d" }),
  ],
  ["post", /^\/saveConfig$/, () => ({ status: 200 })],
  ["get", /^\/getConfig$/, () => ({ status: 200, message: seed.seedConfigArr })],
  ["post", /^\/deleteConfig$/, () => ({ status: 200 })],
  ["get", /^\/getResults$/, () => ({ status: 200, message: seed.seedResults })],
  ["post", /^\/uploadFile$/, () => ({ status: "200" })],
  ["get", /^\/check-cluster-runs$/, () => ({ runs: [] })],

  // --- analysis / opensearch ---
  ["post", /^\/summary$/, () => seed.seedSummary],
  ["post", /^\/comparison$/, () => seed.seedComparison],
  ["post", /^\/alertsAnalysis$/, () => seed.seedAlerts],
  [
    "post",
    /^\/connect-es$/,
    () => ({
      status: 200,
      results: {
        data: seed.seedEsDocs,
        pagination: seed.seedEsPagination,
        filters: seed.seedEsFilters,
      },
    }),
  ],
  ["get", /^\/grafana-dashboard-index$/, () => ({ dashboards: [] })],

  // --- past runs ---
  ["post", /^\/past-runs\/allocate-replay-name$/, () => ({ name: "krkn-replay" })],
  ["post", /^\/past-runs\/export$/, () => ({ blob: true, data: seed.seedLogText })],
  [
    "get",
    /^\/past-runs\/([^/]+)\/export$/,
    () => ({ blob: true, data: seed.seedLogText }),
  ],
  ["post", /^\/past-runs$/, () => seed.seedPastRuns],
  [
    "get",
    /^\/past-runs\/([^/]+)$/,
    (_c, m) => seed.seedRunDetail(decodeURIComponent(m[1])),
  ],

  // --- downloads ---
  ["post", /^\/downloadLogs$/, () => ({ blob: true, data: seed.seedLogText })],
];

const makeResponse = (config, body) => {
  const isBlob = body && body.blob === true;
  const data = isBlob
    ? new Blob([body.data], { type: "text/plain" })
    : body;
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: { "content-type": isBlob ? "text/plain" : "application/json" },
    config,
    request: {},
  };
};

export const previewAdapter = (config) =>
  new Promise((resolve) => {
    const method = (config.method || "get").toLowerCase();
    const path = pathOf(config);
    const route = routes.find(([m, re]) => m === method && re.test(path));

    if (!route) {
      // Unknown endpoint: don't break the UI — return an empty 200.
      // eslint-disable-next-line no-console
      console.warn(`[preview] unmocked ${method.toUpperCase()} ${path} -> {}`);
      resolve(makeResponse(config, {}));
      return;
    }

    const match = route[1].exec(path);
    const body = route[2](config, match);
    // Tiny delay so loading states are briefly visible (feels closer to real).
    setTimeout(() => resolve(makeResponse(config, body)), 120);
  });
