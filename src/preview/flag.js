// Single source of truth for "are we running the static GitHub Pages preview build?"
//
// The PR-preview workflow builds the frontend with VITE_PREVIEW_MODE=true. In a
// normal/production build the variable is unset, IS_PREVIEW is the compile-time
// constant `false`, and every preview-only branch is dead-code-eliminated by the
// bundler — so none of the mock/seed code ships in real builds.
export const IS_PREVIEW = import.meta.env.VITE_PREVIEW_MODE === "true";
