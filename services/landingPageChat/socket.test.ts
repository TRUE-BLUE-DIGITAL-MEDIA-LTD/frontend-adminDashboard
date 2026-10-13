import { describe, expect, it } from "vitest";
import { socketTarget } from "./socket";

describe("socketTarget", () => {
  it("uses the origin + namespace and the default path", () => {
    expect(socketTarget("https://api.example.com")).toEqual({ url: "https://api.example.com/lp-chat", path: "/socket.io" });
  });

  it("keeps a path prefix for the socket.io path, not the namespace", () => {
    expect(socketTarget("https://example.com/api/")).toEqual({ url: "https://example.com/lp-chat", path: "/api/socket.io" });
  });
});
