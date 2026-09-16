import { afterEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import { requestSignUpCode, verifySignUpCode } from "./sign-up";

vi.mock("axios", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedPost = axios.post as unknown as ReturnType<typeof vi.fn>;

afterEach(() => {
  mockedPost.mockReset();
});

describe("requestSignUpCode", () => {
  it("posts to the request-code endpoint with the turnstile token", async () => {
    mockedPost.mockResolvedValueOnce({ data: undefined });

    const input = {
      name: "Jane",
      email: "jane@example.com",
      password: "password123",
      confirmPassword: "password123",
      turnstileToken: "turnstile-token",
    };

    await requestSignUpCode(input);

    expect(mockedPost).toHaveBeenCalledTimes(1);
    const [url, body] = mockedPost.mock.calls[0];
    expect(url).toContain("/auth/sign-up/request-code");
    expect(body).toEqual(input);
    expect(body.turnstileToken).toBe("turnstile-token");
  });

  it("rethrows err.response.data on failure", async () => {
    const errorData = { message: "Invalid turnstile token", statusCode: 400 };
    mockedPost.mockRejectedValueOnce({ response: { data: errorData } });

    await expect(
      requestSignUpCode({
        name: "Jane",
        email: "jane@example.com",
        password: "password123",
        confirmPassword: "password123",
        turnstileToken: "bad-token",
      }),
    ).rejects.toEqual(errorData);
  });
});

describe("verifySignUpCode", () => {
  it("posts to the verify-code endpoint and resolves with no token/session field", async () => {
    mockedPost.mockResolvedValueOnce({ data: { ok: true } });

    const result = await verifySignUpCode({
      email: "jane@example.com",
      code: "123456",
    });

    expect(mockedPost).toHaveBeenCalledTimes(1);
    const [url, body] = mockedPost.mock.calls[0];
    expect(url).toContain("/auth/sign-up/verify-code");
    expect(body).toEqual({ email: "jane@example.com", code: "123456" });
    expect(result).toEqual({ ok: true });
    expect(result).not.toHaveProperty("token");
    expect(result).not.toHaveProperty("session");
    expect(Object.keys(result)).toEqual(["ok"]);
  });

  it("rethrows err.response.data on failure", async () => {
    const errorData = { message: "Invalid or expired code", statusCode: 400 };
    mockedPost.mockRejectedValueOnce({ response: { data: errorData } });

    await expect(
      verifySignUpCode({ email: "jane@example.com", code: "000000" }),
    ).rejects.toEqual(errorData);
  });
});
