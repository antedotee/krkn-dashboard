import socketIOClient from "socket.io-client";

import { IS_PREVIEW } from "@/preview/flag";
import { createMockSocket } from "@/preview/mockSocket";

// Single place sockets are created. In the static PR preview there is no
// backend to connect to, so we return a fake socket that emits seeded data.
export function createSocket(url, options) {
  if (IS_PREVIEW) {
    return createMockSocket();
  }
  return socketIOClient.io(url, options);
}
