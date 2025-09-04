import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db/drizzle";
import { nextCookies } from "better-auth/next-js";
import { schema } from "@/db/schema";

export const auth = betterAuth({
    appName: "Artificial AML",

    database: drizzleAdapter(db, {
        provider: "sqlite",
        schema: schema
    }),

    socialProviders: {
        atlassian: {
            clientId: process.env.ATLASSIAN_CLIENT_ID as string,
            clientSecret: process.env.ATLASSIAN_CLIENT_SECRET as string,
            scope: ["read:jira-work", "write:jira-work", "read:jira-user", "read:me", "offline_access"]
        },
    },

    logger: {
        disabled: (process.env.NODE_ENV as string) === "production",
        level: "debug",
    },

    // nextCookies must be set as the last plugin. used for signInEmail or signUpEmail
    plugins: [nextCookies()],
});