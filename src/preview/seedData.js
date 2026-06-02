// =============================================================================
// SEED DATA FOR THE STATIC PR PREVIEW (GitHub Pages)
//
// Everything in this file is SYNTHETIC, fake demo data. It is only used when the
// app is built with VITE_PREVIEW_MODE=true and served as a static site with no
// backend. It exists so reviewers can browse every page/chart of a PR's UI with
// realistic-looking content. Nothing here is real cluster/user/secret data.
// =============================================================================

// Build a status bucket the way the OpenSearch aggregations return them:
// "1" = passing run count, "0" = failing run count, total = both.
const bucket = (key, pass, fail) => ({
  key,
  1: pass,
  0: fail,
  total: pass + fail,
});

// ---- Auth -------------------------------------------------------------------

export const seedUser = {
  id: 1,
  username: "preview-admin",
  role: "admin",
  groupIds: [1, 2],
};

export const seedUsers = [
  { id: 1, username: "preview-admin", role: "admin", groupIds: [1, 2] },
  { id: 2, username: "alice", role: "user", groupIds: [1] },
  { id: 3, username: "bob", role: "user", groupIds: [2] },
];

export const seedGroups = [
  {
    id: 1,
    name: "Platform SRE",
    members: [
      { userId: 1, username: "preview-admin", groupRole: "group_admin" },
      { userId: 2, username: "alice", groupRole: "group_user" },
    ],
    policies: [
      {
        id: 11,
        clusterKey: "https://api.staging.example.com:6443",
        permissions: ["view", "run", "cancel"],
      },
    ],
  },
  {
    id: 2,
    name: "Payments",
    members: [
      { userId: 1, username: "preview-admin", groupRole: "group_admin" },
      { userId: 3, username: "bob", groupRole: "group_viewer" },
    ],
    policies: [
      {
        id: 21,
        clusterKey: "https://api.prod.example.com:6443",
        permissions: ["view"],
      },
    ],
  },
];

export const seedKubeconfigs = [
  {
    id: 1,
    name: "staging-cluster",
    groupId: 1,
    clusterKey: "https://api.staging.example.com:6443",
    uploadedBy: "preview-admin",
  },
  {
    id: 2,
    name: "prod-cluster",
    groupId: 2,
    clusterKey: "https://api.prod.example.com:6443",
    uploadedBy: "preview-admin",
  },
];

// ---- /summary aggregations --------------------------------------------------
// Shape consumed by Analysis metric cards + Summary charts/tables.

export const seedSummary = {
  summary: {
    total_runs: 142,
    success: 113,
    failure: 29,
    pass_rate: "79.6%",
  },
  scenario_type: [
    bucket("pod_scenarios", 34, 6),
    bucket("node_scenarios", 18, 7),
    bucket("network_chaos", 22, 5),
    bucket("application_outages", 15, 4),
    bucket("service_disruption", 13, 4),
    bucket("zone_outages", 11, 3),
  ],
  cloud_type: [
    bucket("aws", 52, 11),
    bucket("gcp", 33, 9),
    bucket("azure", 28, 9),
  ],
  cloud_infra: [
    bucket("self-managed", 40, 8),
    bucket("rosa", 26, 7),
    bucket("aro", 20, 6),
    bucket("gke", 27, 8),
  ],
  major_version: [
    bucket("4.14", 30, 9),
    bucket("4.15", 41, 10),
    bucket("4.16", 42, 10),
  ],
};

// ---- /comparison ------------------------------------------------------------
// Used when "Group by" is not "Status" (heatmap + cloud charts).

const cmpSub = (key, total, success) => ({
  key,
  total,
  success,
  failure: total - success,
});

export const seedComparison = {
  groups: [
    {
      key: "4.14",
      sub_groups: {
        scenario_type: [
          cmpSub("pod_scenarios", 14, 11),
          cmpSub("network_chaos", 12, 9),
          cmpSub("node_scenarios", 9, 6),
        ],
        cloud_type: [cmpSub("aws", 20, 16), cmpSub("gcp", 19, 14)],
      },
    },
    {
      key: "4.15",
      sub_groups: {
        scenario_type: [
          cmpSub("pod_scenarios", 16, 14),
          cmpSub("network_chaos", 13, 10),
          cmpSub("zone_outages", 8, 5),
        ],
        cloud_type: [cmpSub("aws", 24, 20), cmpSub("azure", 16, 12)],
      },
    },
    {
      key: "4.16",
      sub_groups: {
        scenario_type: [
          cmpSub("pod_scenarios", 18, 15),
          cmpSub("service_disruption", 11, 8),
          cmpSub("application_outages", 10, 7),
        ],
        cloud_type: [cmpSub("aws", 22, 18), cmpSub("gcp", 18, 14)],
      },
    },
  ],
};

// ---- /alertsAnalysis --------------------------------------------------------

export const seedAlerts = {
  alerts: [
    {
      run_uuid: "a1b2c3d4-1111-4aaa-9bbb-000000000001",
      scenario_type: "pod_scenarios",
      alert:
        "KubePodCrashLooping: Pod openshift-etcd/etcd-master-0 has been restarting 5 times in the last 10 minutes.",
      severity: "critical",
    },
    {
      run_uuid: "a1b2c3d4-2222-4aaa-9bbb-000000000002",
      scenario_type: "node_scenarios",
      alert:
        "KubeNodeNotReady: Node worker-2 has been unready for more than 5 minutes during the node restart scenario.",
      severity: "warning",
    },
    {
      run_uuid: "a1b2c3d4-3333-4aaa-9bbb-000000000003",
      scenario_type: "network_chaos",
      alert:
        "TargetDown: 25% of the ingress-router targets are down while applying network latency.",
      severity: "error",
    },
    {
      run_uuid: "a1b2c3d4-4444-4aaa-9bbb-000000000004",
      scenario_type: "application_outages",
      alert:
        "KubeDeploymentReplicasMismatch: Deployment payments/checkout has not matched the expected replicas.",
      severity: "warning",
    },
  ],
};

// ---- /connect-es (Runs table) ----------------------------------------------

const esDoc = (id, scenario, status, namespace, daysAgo) => {
  // Static, build-time-stamped dates (no Date.now at module init needed at runtime;
  // these are plain ISO strings so they render deterministically).
  const start = `2026-05-${String(28 - daysAgo).padStart(2, "0")}T09:15:00`;
  const end = `2026-05-${String(28 - daysAgo).padStart(2, "0")}T09:42:00`;
  return {
    id,
    uuid: `run-${id}-uuid`,
    scenario_type: scenario,
    start_time: start,
    end_time: end,
    status,
    config: {
      parameters: { namespace_pattern: namespace },
      scenario_type: scenario,
    },
  };
};

export const seedEsDocs = [
  esDoc("run-001", "pod_scenarios", "pass", "openshift-.*", 0),
  esDoc("run-002", "network_chaos", "fail", "ingress-.*", 1),
  esDoc("run-003", "node_scenarios", "pass", "openshift-etcd", 2),
  esDoc("run-004", "application_outages", "pass", "payments", 3),
  esDoc("run-005", "service_disruption", "fail", "checkout", 4),
  esDoc("run-006", "zone_outages", "pass", "openshift-.*", 5),
];

export const seedEsFilters = [
  { name: "Status", value: ["pass", "fail"] },
  { name: "Cloud Infrastructure", value: ["aws", "gcp", "azure"] },
  { name: "Cloud Type", value: ["self-managed", "rosa", "aro", "gke"] },
  { name: "Version", value: ["4.14", "4.15", "4.16"] },
];

export const seedEsPagination = {
  total: 142,
  currentPage: 1,
  totalPages: 6,
  hasNext: true,
  hasPrevious: false,
};

// ES connection details the preview "connects" with (no real host is contacted).
export const seedConnectionInput = {
  host: "https://preview-opensearch.example.com:9200",
  index: "krkn-chaos-recommendations",
  username: "preview",
  password: "preview",
  grafanaBaseUrl: "",
  grafanaDashboardIndex: [],
};

// ---- Live pods (socket "podStatus") + Results -------------------------------

export const seedPodDetails = [
  {
    Id: "3f9a8b7c6d5e4a2b1c0d",
    Image: "quay.io/krkn-chaos/krkn-hub:pod-scenarios",
    CreatedAt: "2 minutes ago",
    Names: "krkn-pod-scenarios",
    Mounts: "/home/krkn/kubeconfig",
    State: "running",
    ExitCode: 0,
  },
  {
    Id: "a1b2c3d4e5f6a7b8c9d0",
    Image: "quay.io/krkn-chaos/krkn-hub:node-cpu-hog",
    CreatedAt: "12 minutes ago",
    Names: "krkn-node-cpu-hog",
    Mounts: "/home/krkn/kubeconfig",
    State: "exited",
    ExitCode: 0,
  },
];

export const seedResults = [
  {
    container_id: "3f9a8b7c6d5e4a2b1c0d",
    image: "quay.io/krkn-chaos/krkn-hub:pod-scenarios",
    name: "krkn-pod-scenarios",
    mounts: "/home/krkn/kubeconfig",
    state: "running",
    status: 0,
  },
  {
    container_id: "a1b2c3d4e5f6a7b8c9d0",
    image: "quay.io/krkn-chaos/krkn-hub:node-cpu-hog",
    name: "krkn-node-cpu-hog",
    mounts: "/home/krkn/kubeconfig",
    state: "exited",
    status: 0,
  },
  {
    container_id: "9988776655443322110a",
    image: "quay.io/krkn-chaos/krkn-hub:network-chaos",
    name: "krkn-network-chaos",
    mounts: "/home/krkn/kubeconfig",
    state: "exited",
    status: 1,
  },
];

export const seedLogText = [
  "2026-05-28 09:15:01,001 [INFO] Starting Kraken chaos run (pod-scenarios)",
  "2026-05-28 09:15:01,204 [INFO] Initializing kubernetes client from kubeconfig",
  "2026-05-28 09:15:02,553 [INFO] Connected to cluster: https://api.staging.example.com:6443",
  "2026-05-28 09:15:03,010 [INFO] Scenario: kill 1 pod in namespace openshift-etcd",
  "2026-05-28 09:15:04,318 [INFO] Killing pod etcd-master-0",
  "2026-05-28 09:15:06,901 [INFO] Waiting for pod to recover...",
  "2026-05-28 09:15:21,447 [INFO] Pod etcd-master-0 is Running again",
  "2026-05-28 09:15:22,002 [INFO] Cerberus health check: cluster healthy",
  "2026-05-28 09:15:22,560 [INFO] Scenario passed. Recovery time: 17s",
  "2026-05-28 09:15:23,118 [INFO] Run finished with status: PASS",
].join("\n");

// ---- /getConfig (saved scenario parameters) ---------------------------------

export const seedConfigArr = [
  {
    id: 1,
    name: "etcd-pod-kill",
    params: { scenario_type: "pod-scenarios", namespace: "openshift-etcd" },
  },
  {
    id: 2,
    name: "worker-cpu-hog",
    params: { scenario_type: "node-cpu-hog", duration: "120" },
  },
];

// ---- /past-runs -------------------------------------------------------------

const runRow = (id, name, scenario, outcome, daysAgo, replayOf = null) => {
  const finished = `2026-05-${String(28 - daysAgo).padStart(2, "0")}T09:42:00`;
  return {
    container_id: id,
    name,
    image: `quay.io/krkn-chaos/krkn-hub:${scenario}`,
    scenario_type: scenario,
    state: "exited",
    status: outcome === "pass" ? 0 : 1, // exit code
    outcome, // "pass" | "fail"
    job_status: outcome === "pass" ? 1 : 0,
    stored_at: finished,
    finishedAt: finished,
    replay_of_container_id: replayOf,
    content: seedLogText,
  };
};

export const seedPastRuns = {
  stats: { total: 6, passes: 4, fails: 2, passPercent: 66.7 },
  pagination: { page: 1, perPage: 25, itemCount: 6, totalPages: 1 },
  groups: [
    {
      root: runRow("pr-001", "krkn-pod-scenarios", "pod-scenarios", "pass", 0),
      replays: [
        runRow(
          "pr-001-r1",
          "krkn-pod-scenarios-replay",
          "pod-scenarios",
          "pass",
          0,
          "pr-001"
        ),
      ],
    },
    {
      root: runRow("pr-002", "krkn-network-chaos", "network-chaos", "fail", 1),
      replays: [],
    },
    {
      root: runRow("pr-003", "krkn-node-scenarios", "node-scenarios", "pass", 2),
      replays: [],
    },
  ],
};

export const seedRunDetail = (id) => ({
  run: runRow(id || "pr-001", "krkn-pod-scenarios", "pod-scenarios", "pass", 0),
});
