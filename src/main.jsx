import "./index.css";
import "@patternfly/react-core/dist/styles/base.css";

import App from "./App.jsx";
import { Provider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom/client";
import store from "./store/store";
import { IS_PREVIEW } from "@/preview/flag";

// Static PR preview: seed the store so data-gated views (Analysis, Runs) render
// populated without a backend or any user gesture.
if (IS_PREVIEW) {
  import("@/preview/boot").then(({ bootPreview }) => bootPreview(store));
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
