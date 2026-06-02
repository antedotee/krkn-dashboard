// Fake socket.io client for the static PR preview.
//
// The real Overview page opens a socket.io connection to the Express backend to
// stream live pod status and container logs. There is no backend on GitHub
// Pages, so in preview mode we hand the app this stand-in. It mimics the small
// slice of the socket.io client API the app actually uses (on/off/emit/
// disconnect) and replies to the app's requests with seeded data.

import { seedLogText, seedPodDetails } from "./seedData";

export function createMockSocket() {
  const listeners = {};
  let alive = true;

  const fire = (event, payload) => {
    if (!alive) return;
    (listeners[event] || []).forEach((cb) => {
      try {
        cb(payload);
      } catch {
        /* ignore listener errors in preview */
      }
    });
  };

  const socket = {
    connected: true,
    on(event, cb) {
      (listeners[event] = listeners[event] || []).push(cb);
      return socket;
    },
    off(event) {
      delete listeners[event];
      return socket;
    },
    emit(event) {
      // The app emits to request data; reply shortly after so the listener
      // registered right after emit() is in place before we fire.
      if (event === "podStatus") {
        setTimeout(() => fire("podStatus", seedPodDetails), 250);
      } else if (event === "logs") {
        setTimeout(() => fire("logs", seedLogText), 250);
      }
      return socket;
    },
    disconnect() {
      alive = false;
      Object.keys(listeners).forEach((k) => delete listeners[k]);
      return socket;
    },
    close() {
      return socket.disconnect();
    },
  };

  return socket;
}
