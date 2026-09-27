import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "eslint.config.js", "vite.config.ts", "postcss.config.js", "tailwind.config.js"]
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx}"],
    plugins: {
      react: pluginReact,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  ...tseslint.configs.recommended,
];
