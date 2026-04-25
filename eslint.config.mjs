import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import importSort from "eslint-plugin-simple-import-sort";
import noUntestedClickable from "./eslint-rules/no-untested-clickable.cjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "simple-import-sort": importSort,
      paddocpro: { rules: { "no-untested-clickable": noUntestedClickable } },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": "warn",
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      // jsx-a11y is already provided by eslint-config-next; sharpen severity here.
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-role": "error",
      // Activated after Plan 03 lands the shell primitives that own most clickables.
      // Until then it would falsely flag stub pages.
      "paddocpro/no-untested-clickable": "off",
    },
  },
]);

export default eslintConfig;
