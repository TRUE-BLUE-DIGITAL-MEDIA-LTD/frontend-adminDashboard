// @vitest-environment jsdom
import React from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// react 18.3 exports `act`, but @types/react 18.2 does not declare it yet.
const { act } = React as unknown as { act: (cb: () => unknown) => void };

const mocks = vi.hoisted(() => ({
  rows: [] as Record<string, unknown>[],
}));

vi.mock("../../react-query", () => ({
  useGetHistorySmsBulkEmail: () => ({ data: { data: mocks.rows, totalPage: 1 } }),
}));

import EmailHistory from "./EmailHistory";

const row = (over: Record<string, unknown>) => ({
  id: "e1",
  createAt: "2026-09-19T10:00:00Z",
  emailAddress: "abc@gmx.com",
  site: "telegram.com",
  price: 0.04,
  isGetSms: true,
  otpValue: "123456",
  htmlMessage: null,
  ...over,
});

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

const reorderButtons = () =>
  Array.from(container.querySelectorAll("button")).filter((b) => b.textContent === "Reorder");

describe("EmailHistory", () => {
  it("shows a Reorder button only on rows that received an OTP", () => {
    mocks.rows = [row({ id: "e1" }), row({ id: "e2", isGetSms: false, otpValue: null })];
    act(() => {
      root.render(React.createElement(EmailHistory, { onReorder: () => {} }));
    });
    expect(reorderButtons()).toHaveLength(1);
  });

  it("calls onReorder with the row id when Reorder is clicked", () => {
    const onReorder = vi.fn();
    mocks.rows = [row({ id: "e1" })];
    act(() => {
      root.render(React.createElement(EmailHistory, { onReorder }));
    });
    act(() => reorderButtons()[0].click());
    expect(onReorder).toHaveBeenCalledWith("e1");
  });
});
