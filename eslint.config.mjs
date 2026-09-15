import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginJSX from "eslint-plugin-jsx-a11y";
import pluginImport from "eslint-plugin-import";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      react: pluginReact,
      "react-hooks": pluginReactHooks,
      "jsx-a11y": pluginJSX,
      import: pluginImport,
    },
    rules: {
      ...pluginReact.configs.recommended.rules,
      ...pluginReactHooks.configs.recommended.rules,
      ...pluginJSX.configs.recommended.rules,
      ...pluginImport.configs.recommended.rules,
      "react/prop-types": "off", // 👈 disables missing prop validation
      "import/no-unresolved": "off",
      "indent": ["error", 2, {
        "SwitchCase": 1,  // indent switch cases by 1 level
        "VariableDeclarator": 1,
        "outerIIFEBody": 1,
        "FunctionDeclaration": { "parameters": 1, "body": 1 },
        "FunctionExpression": { "parameters": 1, "body": 1 },
        "CallExpression": { "arguments": 1 },
        "ArrayExpression": 1,
        "ObjectExpression": 1,
        "ImportDeclaration": 1,
        "flatTernaryExpressions": false,
        "ignoreComments": false
      }],
      // Airbnb-like extras
      "keyword-spacing": ["error", { "before": true, "after": true }],
      "space-before-blocks": ["error", "always"],
      "space-infix-ops": "error",
      "no-multi-spaces": "error",
      "space-before-function-paren": ["error", "never"],

      // 👉 Quotes
      "quotes": ["error", "double", { "avoidEscape": true, "allowTemplateLiterals": true }],

      // 👉 Semicolons
      "semi": ["error", "always"],
      "no-extra-semi": "error",
      "react/jsx-filename-extension": ["warn", { extensions: [".js", ".jsx"] }],
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "import/order": [
        "warn",
        {
          groups: [["builtin", "external", "internal"]],
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "no-console": "warn",
    },
  },
]);
