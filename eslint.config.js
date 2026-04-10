import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
    { ignores: ["dist", "node_modules", "*.config.*"] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2024,
            globals: globals.browser,
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            "@stylistic": stylistic,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": "off",

            // ── Core ESLint rules ──────────────────────────────────────
            "no-console": ["error", { allow: ["warn", "error"] }],
            "no-debugger": "error",
            "no-alert": "error",
            "no-duplicate-imports": "error",
            "no-self-compare": "error",
            "no-template-curly-in-string": "error",
            "no-unmodified-loop-condition": "error",
            "no-unreachable-loop": "error",
            "no-use-before-define": "off",
            "curly": ["error", "multi-line"],
            "default-case-last": "error",
            "eqeqeq": ["error", "always", { null: "ignore" }],
            "grouped-accessor-pairs": "error",
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-new-wrappers": "error",
            "no-return-assign": "error",
            "no-sequences": "error",
            "no-throw-literal": "error",
            "no-var": "error",
            "no-useless-rename": "error",
            "prefer-const": "error",
            "prefer-rest-params": "error",

            // ── TypeScript rules ────────────────────────────────────────
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "error",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-non-null-assertion": "error",
            "@typescript-eslint/prefer-as-const": "error",

            // ── Stylistic rules (auto-fixable) ─────────────────────────
            "@stylistic/semi": ["error", "always"],
            "@stylistic/no-trailing-spaces": "error",
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
            "@stylistic/comma-dangle": ["error", "always-multiline"],
            "@stylistic/quotes": ["error", "double", { avoidEscape: true }],
            "@stylistic/object-curly-spacing": ["error", "always"],
            "@stylistic/array-bracket-spacing": ["error", "never"],
            "@stylistic/arrow-spacing": "error",
            "@stylistic/block-spacing": "error",
            "@stylistic/comma-spacing": "error",
            "@stylistic/key-spacing": "error",
            "@stylistic/keyword-spacing": "error",
            "@stylistic/space-before-blocks": "error",
            "@stylistic/space-infix-ops": "error",
            "@stylistic/no-multi-spaces": "error",
        },
    },
);
