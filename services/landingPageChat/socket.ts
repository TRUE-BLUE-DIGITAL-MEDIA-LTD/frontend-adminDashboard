import { io, type Socket } from "socket.io-client";

/**
 * socket.io treats the URL path as the namespace, so a server URL with a
 * path prefix must move that prefix into the transport `path` instead.
 */
export function socketTarget(serverUrl: string): { url: string; path: string } {
  const parsed = new URL(serverUrl);
  const base = parsed.pathname.replace(/\/+$/, "");
  return { url: `${parsed.origin}/lp-chat`, path: `${base}/socket.io` };
}

export function createLpChatSocket(serverUrl: string, token: string): Socket {
  const { url, path } = socketTarget(serverUrl);
  // WebSocket only: avoids needing sticky sessions for long-polling across instances.
  return io(url, { path, auth: { token }, transports: ["websocket"], autoConnect: false });
}
