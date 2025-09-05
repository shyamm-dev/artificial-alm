import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import noDirectSessionApi from "./eslint/rules/no-direct-session-api.js";
import noClientAccessToken from "./eslint/rules/no-client-access-token.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      'custom-rules': {
        rules: {
          'no-direct-session-api': noDirectSessionApi,
          'no-client-access-token': noClientAccessToken,
        }
      }
    },
    rules: {
      "custom-rules/no-direct-session-api": "error",
      "custom-rules/no-client-access-token": "error",
    },
  },
  {
    ignores: [
      "lib/get-server-session.ts",
      "eslint/**",
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
