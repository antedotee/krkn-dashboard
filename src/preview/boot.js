// Pre-populates the Redux store for the static PR preview.
//
// Most pages fetch their own data on mount (and the mock adapter answers those),
// but a few views are gated behind a user gesture in the real app — chiefly the
// Analysis page, which only loads data after you "connect" to Elasticsearch.
// Here we drive the app's own thunks/actions (through the mock adapter) so those
// views are already populated when a reviewer navigates to them.

import { GET_PODMAN_STATUS } from "@/actions/types";
import { esConnect } from "@/actions/storageActions";
import {
  fetchAlertsData,
} from "@/actions/alertsActions";
import {
  fetchComparisonData,
  fetchSummaryData,
} from "@/actions/summaryActions";
import { getConfig, getDetails } from "@/actions/newExperiment";
import { seedConnectionInput } from "./seedData";

export function bootPreview(store) {
  // Podman "installed" so the Overview live-pods view activates.
  store.dispatch({ type: GET_PODMAN_STATUS, payload: true });

  // "Connect" to Elasticsearch — populates the Runs table + connection banner
  // and unlocks the Analysis page (which otherwise shows the connect form).
  store.dispatch(esConnect(seedConnectionInput));

  // Summary metrics, comparison heatmaps, alert analysis.
  store.dispatch(fetchSummaryData());
  store.dispatch(fetchComparisonData());
  store.dispatch(fetchAlertsData());

  // Results table + saved scenario configs.
  store.dispatch(getDetails());
  store.dispatch(getConfig());
}
