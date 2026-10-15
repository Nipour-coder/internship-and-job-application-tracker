import axios from "axios";
import request from "supertest";
import app from "../src/server";
import { dbService } from "../src/services/db.service";

describe("OAuth authorization flow", () => {
  const originalEnv = {
    clientUrl: process.env.CLIENT_URL,
    serverUrl: process.env.SERVER_URL,
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientId: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET,
  };

  beforeEach(() => {
    process.env.CLIENT_URL = "http://localhost:3000";
    process.env.SERVER_URL = "https://api.example.test";
    delete process.env.GOOGLE_CLIENT_ID;
    delete process.env.GOOGLE_CLIENT_SECRET;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });

  afterAll(() => {
    if (originalEnv.clientUrl === undefined) delete process.env.CLIENT_URL;
    else process.env.CLIENT_URL = originalEnv.clientUrl;

    if (originalEnv.serverUrl === undefined) delete process.env.SERVER_URL;
    else process.env.SERVER_URL = originalEnv.serverUrl;

    if (originalEnv.googleClientId === undefined) delete process.env.GOOGLE_CLIENT_ID;
    else process.env.GOOGLE_CLIENT_ID = originalEnv.googleClientId;

    if (originalEnv.googleClientSecret === undefined) delete process.env.GOOGLE_CLIENT_SECRET;
    else process.env.GOOGLE_CLIENT_SECRET = originalEnv.googleClientSecret;

    if (originalEnv.githubClientId === undefined) delete process.env.GITHUB_CLIENT_ID;
    else process.env.GITHUB_CLIENT_ID = originalEnv.githubClientId;

    if (originalEnv.githubClientSecret === undefined) delete process.env.GITHUB_CLIENT_SECRET;
    else process.env.GITHUB_CLIENT_SECRET = originalEnv.githubClientSecret;
  });

  it("reports provider configuration requirements", async () => {
    const response = await request(app).get("/api/auth/google?check=true");

    expect(response.status).toBe(501);
    expect(response.body.error).toContain("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
  });

  it("starts Google authorization with a backend callback and state cookie", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

    const response = await request(app).get("/api/auth/google");
    expect(response.status).toBe(302);
    const location = new URL(response.headers.location || "http://invalid.local");
    const stateCookie = response.headers["set-cookie"]?.[0];

    expect(location.origin).toBe("https://accounts.google.com");
    expect(location.searchParams.get("redirect_uri")).toBe(
      "https://api.example.test/api/auth/callback/google"
    );
    expect(location.searchParams.get("state")).toBeTruthy();
    expect(stateCookie).toContain(`oauth_state=${location.searchParams.get("state")}`);
    expect(stateCookie).toContain("HttpOnly");
  });

  it("checks provider configuration without following the OAuth redirect", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

    const response = await request(app).get("/api/auth/google?check=true");

    expect(response.status).toBe(204);
  });

  it("exchanges a Google code, creates the account, and returns a tracker session", async () => {
    process.env.GOOGLE_CLIENT_ID = "test-client-id";
    process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

    const findUser = jest.spyOn(dbService, "findUserByEmail").mockResolvedValue(null);
    const createUser = jest.spyOn(dbService, "createUser").mockResolvedValue({
      id: "oauth-user-id",
      email: "candidate@example.com",
      fullName: "Candidate",
    } as never);
    jest.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "provider-access-token" },
    } as never);
    jest.spyOn(axios, "get").mockResolvedValue({
      data: {
        email: "candidate@example.com",
        email_verified: true,
        name: "Candidate",
      },
    } as never);

    const agent = request.agent(app);
    const startResponse = await agent.get("/api/auth/google");
    const authorizationUrl = new URL(startResponse.headers.location || "http://invalid.local");
    const callbackResponse = await agent.get(
      `/api/auth/callback/google?state=${authorizationUrl.searchParams.get("state")}&code=provider-code`
    );

    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toMatch(
      /^http:\/\/localhost:3000\/auth\/callback#token=/
    );
    expect(findUser).toHaveBeenCalledWith("candidate@example.com");
    expect(createUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "candidate@example.com",
        fullName: "Candidate",
        avatarUrl: undefined,
      })
    );
  });

  it("uses a verified GitHub email to return a tracker session", async () => {
    process.env.GITHUB_CLIENT_ID = "test-github-client-id";
    process.env.GITHUB_CLIENT_SECRET = "test-github-client-secret";

    const findUser = jest.spyOn(dbService, "findUserByEmail").mockResolvedValue({
      id: "existing-user-id",
      email: "candidate@example.com",
      fullName: "Candidate",
    } as never);
    jest.spyOn(axios, "post").mockResolvedValue({
      data: { access_token: "github-access-token" },
    } as never);
    jest.spyOn(axios, "get")
      .mockResolvedValueOnce({
        data: { login: "candidate", name: "Candidate" },
      } as never)
      .mockResolvedValueOnce({
        data: [{ email: "candidate@example.com", primary: true, verified: true }],
      } as never);

    const agent = request.agent(app);
    const startResponse = await agent.get("/api/auth/github");
    const authorizationUrl = new URL(startResponse.headers.location || "http://invalid.local");
    const callbackResponse = await agent.get(
      `/api/auth/callback/github?state=${authorizationUrl.searchParams.get("state")}&code=provider-code`
    );

    expect(authorizationUrl.origin).toBe("https://github.com");
    expect(authorizationUrl.searchParams.get("redirect_uri")).toBe(
      "https://api.example.test/api/auth/callback/github"
    );
    expect(callbackResponse.status).toBe(302);
    expect(callbackResponse.headers.location).toMatch(
      /^http:\/\/localhost:3000\/auth\/callback#token=/
    );
    expect(findUser).toHaveBeenCalledWith("candidate@example.com");
  });

  it("rejects OAuth callbacks without matching state", async () => {
    const response = await request(app)
      .get("/api/auth/callback/google?state=attacker&code=unused");

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      "http://localhost:3000/login?error=oauth_invalid_state"
    );
  });

  it("rejects malformed state values without comparing buffers of different sizes", async () => {
    const expectedState = "a".repeat(64);
    const providedState = encodeURIComponent("😀".repeat(32));
    const response = await request(app)
      .get(`/api/auth/callback/google?state=${providedState}&code=unused`)
      .set("Cookie", `oauth_state=${expectedState}`);

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe(
      "http://localhost:3000/login?error=oauth_invalid_state"
    );
  });
});
