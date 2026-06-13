import { createHash } from "crypto";
import { beforeEach, describe, expect, it } from "vitest";

const password = "GRME-Admin-2026";
const passwordHash = createHash("sha256").update(password).digest("hex");

beforeEach(() => {
  process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH = passwordHash;
  process.env.GRME_SESSION_SECRET = "test-session-secret";
});

describe("GRME session route", () => {
  it("creates an admin session cookie and returns the user", async () => {
    const { POST, GET } = await import("./route");

    const postResponse = await POST(
      new Request("http://localhost/api/grme/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Admin",
          role: "admin",
          password,
        }),
      })
    );

    expect(postResponse.status).toBe(200);
    const setCookie = postResponse.headers.get("set-cookie") || "";
    expect(setCookie).toContain("grme-session=");

    const cookie = setCookie.split(";")[0];
    const getResponse = await GET(
      new Request("http://localhost/api/grme/session", {
        headers: { cookie },
      })
    );

    expect(getResponse.status).toBe(200);
    await expect(getResponse.json()).resolves.toEqual({
      user: expect.objectContaining({
        name: "Test Admin",
        role: "admin",
      }),
    });
  });
});
