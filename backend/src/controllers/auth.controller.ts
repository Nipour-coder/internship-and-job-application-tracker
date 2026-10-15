import { Request, Response } from "express";
import axios from "axios";
import { randomBytes, timingSafeEqual } from "crypto";
import { z } from "zod";
import { dbService } from "../services/db.service";
import { hashPassword, comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type OAuthProvider = "google" | "github";

function getOAuthCredentials(provider: OAuthProvider) {
  const clientId =
    provider === "google" ? process.env.GOOGLE_CLIENT_ID : process.env.GITHUB_CLIENT_ID;
  const clientSecret =
    provider === "google" ? process.env.GOOGLE_CLIENT_SECRET : process.env.GITHUB_CLIENT_SECRET;

  return { clientId, clientSecret };
}

function getOAuthCallbackUrl(provider: OAuthProvider): string {
  const serverUrl = (
    process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/+$/, "");
  return `${serverUrl}/api/auth/callback/${provider}`;
}

function getClientUrl(): string {
  return (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/+$/, "");
}

function getCookieValue(req: Request, name: string): string | null {
  const prefix = `${name}=`;
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return cookie ? cookie.slice(prefix.length) : null;
}

function matchesOAuthState(expectedState: string | null, providedState: string): boolean {
  if (!expectedState) {
    return false;
  }

  const expectedBytes = Buffer.from(expectedState);
  const providedBytes = Buffer.from(providedState);
  return (
    expectedBytes.length === providedBytes.length &&
    timingSafeEqual(expectedBytes, providedBytes)
  );
}

function getOAuthStateCookieName(): string {
  return process.env.NODE_ENV === "production" ? "__Host-oauth_state" : "oauth_state";
}

function getOAuthStateCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: secure ? "/" : "/api/auth/callback",
  };
}

function clearOAuthStateCookie(res: Response): void {
  res.clearCookie(getOAuthStateCookieName(), getOAuthStateCookieOptions());
}

function redirectToLogin(res: Response, error: string): void {
  res.redirect(`${getClientUrl()}/login?error=${encodeURIComponent(error)}`);
}

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0].message,
        });
      }

      const { email, password, fullName } = parsed.data;

      const existingUser = await dbService.findUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "An account with this email address already exists. Please log in.",
        });
      }

      const passwordHash = await hashPassword(password);
      const user = await dbService.createUser({ email, passwordHash, fullName });

      const token = generateToken({ userId: user.id, email: user.email });

      return res.status(201).json({
        success: true,
        message: "Account registered successfully!",
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      console.error("Register Error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to create user account. Please try again.",
      });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          error: parsed.error.errors[0].message,
        });
      }

      const { email, password } = parsed.data;

      const user = await dbService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password.",
        });
      }

      const isMatch = await comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: "Invalid email or password.",
        });
      }

      const token = generateToken({ userId: user.id, email: user.email });

      return res.status(200).json({
        success: true,
        message: "Logged in successfully!",
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      return res.status(500).json({
        success: false,
        error: "Login request failed. Please try again.",
      });
    }
  },

  async me(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const user = await dbService.findUserById(req.user.userId);
      if (!user) {
        return res.status(404).json({ success: false, error: "User account not found." });
      }

      return res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error("Me Error:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch user profile.",
      });
    }
  },

  async logout(req: Request, res: Response) {
    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  },

  // OAuth authorization-code flow for Google and GitHub.
  async socialLoginRedirect(req: Request, res: Response) {
    const provider = req.params.provider;
    if (provider !== "google" && provider !== "github") {
      return res.status(400).json({ success: false, error: "Unsupported social provider." });
    }

    const { clientId, clientSecret } = getOAuthCredentials(provider);

    if (!clientId || !clientSecret) {
      const requiredCredentials =
        provider === "google"
          ? "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET"
          : "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET";
      return res.status(501).json({
        success: false,
        error: `${provider.toUpperCase()} OAuth credentials are not configured. Set both ${requiredCredentials} in the backend environment.`,
      });
    }

    if (req.query.check === "true") {
      return res.status(204).end();
    }

    const state = randomBytes(32).toString("hex");
    res.cookie(getOAuthStateCookieName(), state, {
      ...getOAuthStateCookieOptions(),
      maxAge: 10 * 60 * 1000,
    });

    const callbackUrl = getOAuthCallbackUrl(provider);
    const authorizationUrl = new URL(
      provider === "google"
        ? "https://accounts.google.com/o/oauth2/v2/auth"
        : "https://github.com/login/oauth/authorize"
    );
    authorizationUrl.searchParams.set("client_id", clientId);
    authorizationUrl.searchParams.set("redirect_uri", callbackUrl);
    authorizationUrl.searchParams.set("state", state);
    authorizationUrl.searchParams.set(
      "scope",
      provider === "google" ? "openid profile email" : "read:user user:email"
    );
    if (provider === "google") {
      authorizationUrl.searchParams.set("response_type", "code");
    }

    return res.redirect(authorizationUrl.toString());
  },

  async socialLoginCallback(req: Request, res: Response) {
    const provider = req.params.provider;
    if (provider !== "google" && provider !== "github") {
      return res.status(400).send("Unsupported social provider.");
    }

    const expectedState = getCookieValue(req, getOAuthStateCookieName());
    const providedState = typeof req.query.state === "string" ? req.query.state : "";
    if (!providedState || !matchesOAuthState(expectedState, providedState)) {
      clearOAuthStateCookie(res);
      redirectToLogin(res, "oauth_invalid_state");
      return;
    }
    clearOAuthStateCookie(res);

    if (req.query.error) {
      redirectToLogin(res, `oauth_${provider}_cancelled`);
      return;
    }

    const code = typeof req.query.code === "string" ? req.query.code : "";
    const { clientId, clientSecret } = getOAuthCredentials(provider);
    if (!code || !clientId || !clientSecret) {
      redirectToLogin(res, "oauth_failed");
      return;
    }

    try {
      let email: string;
      let fullName: string;
      let avatarUrl: string | undefined;

      if (provider === "google") {
        const tokenResponse = await axios.post<{ access_token?: string }>(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: getOAuthCallbackUrl(provider),
            grant_type: "authorization_code",
          }).toString(),
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            timeout: 10000,
          }
        );
        if (!tokenResponse.data.access_token) {
          throw new Error("Google did not return an access token.");
        }

        const profileResponse = await axios.get<{
          email?: string;
          email_verified?: boolean;
          name?: string;
          picture?: string;
        }>("https://openidconnect.googleapis.com/v1/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.data.access_token}` },
          timeout: 10000,
        });
        if (!profileResponse.data.email || profileResponse.data.email_verified !== true) {
          throw new Error("Google account does not have a verified email address.");
        }

        email = profileResponse.data.email;
        fullName = profileResponse.data.name || email.split("@")[0];
        avatarUrl = profileResponse.data.picture;
      } else {
        const tokenResponse = await axios.post<{ access_token?: string; error?: string }>(
          "https://github.com/login/oauth/access_token",
          new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: getOAuthCallbackUrl(provider),
          }).toString(),
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/x-www-form-urlencoded",
            },
            timeout: 10000,
          }
        );
        if (!tokenResponse.data.access_token) {
          throw new Error(tokenResponse.data.error || "GitHub did not return an access token.");
        }

        const accessToken = tokenResponse.data.access_token;
        const [profileResponse, emailsResponse] = await Promise.all([
          axios.get<{ login: string; name?: string | null; avatar_url?: string }>(
            "https://api.github.com/user",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "Internship-Job-Tracker",
              },
              timeout: 10000,
            }
          ),
          axios.get<Array<{ email: string; primary: boolean; verified: boolean }>>(
            "https://api.github.com/user/emails",
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "Internship-Job-Tracker",
              },
              timeout: 10000,
            }
          ),
        ]);
        const verifiedEmail =
          emailsResponse.data.find((item) => item.primary && item.verified) ??
          emailsResponse.data.find((item) => item.verified);
        if (!verifiedEmail) {
          throw new Error("GitHub account does not have a verified email address.");
        }

        email = verifiedEmail.email;
        fullName = profileResponse.data.name || profileResponse.data.login || email.split("@")[0];
        avatarUrl = profileResponse.data.avatar_url;
      }

      let user = await dbService.findUserByEmail(email);
      if (!user) {
        user = await dbService.createUser({
          email,
          fullName,
          avatarUrl,
          passwordHash: await hashPassword(randomBytes(32).toString("hex")),
        });
      }

      const token = generateToken({ userId: user.id, email: user.email });
      res.redirect(`${getClientUrl()}/auth/callback#token=${encodeURIComponent(token)}`);
    } catch (error) {
      console.error(
        `${provider} OAuth callback failed:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      redirectToLogin(res, "oauth_failed");
    }
  },
};
