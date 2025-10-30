import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { nextCookies } from "better-auth/next-js";
import { authSchema } from "@/db/schema/auth-schema";

export const auth = betterAuth({
  appName: "Artificial AML",

  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: { ...authSchema }
  }),

  socialProviders: {
    atlassian: {
      clientId: process.env.ATLASSIAN_CLIENT_ID as string,
      clientSecret: process.env.ATLASSIAN_CLIENT_SECRET as string,
      scope: ["read:jira-work", "write:jira-work", "read:jira-user", "read:me", "offline_access"]
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent"
    },
  },

  // TODO : turborepo is messing with the cookie cache. during logut throws error. Works fine in prod build
  session: {
    cookieCache: {
      enabled: process.env.NODE_ENV === "production",
      maxAge: 5 * 60 // Cache duration in seconds
    }
  },

  logger: {
    disabled: process.env.NODE_ENV === "production",
    level: "debug",
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["atlassian", "google"],
    }
  },

  plugins: [nextCookies()]
});
