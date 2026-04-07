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
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],

            // ── Core ESLint rules ──────────────────────────────────────
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "no-debugger": "warn",
            "no-alert": "warn",
            "no-duplicate-imports": "error",
            "no-self-compare": "error",
            "no-template-curly-in-string": "warn",
            "no-unmodified-loop-condition": "warn",
            "no-unreachable-loop": "error",
            "no-use-before-define": "off", // handled by TS
            "curly": ["warn", "multi-line"],
            "default-case-last": "warn",
            "eqeqeq": ["error", "always", { null: "ignore" }],
            "grouped-accessor-pairs": "warn",
            "no-else-return": "warn",
            "no-eval": "error",
            "no-implied-eval": "error",
            "no-lonely-if": "warn",
            "no-multi-assign": "warn",
            "no-nested-ternary": "warn",
            "no-new-wrappers": "error",
            "no-param-reassign": ["warn", { props: false }],
            "no-return-assign": "error",
            "no-sequences": "error",
            "no-throw-literal": "error",
            "no-unneeded-ternary": "warn",
            "no-useless-concat": "warn",
            "no-useless-rename": "warn",
            "no-useless-return": "warn",
            "no-var": "error",
            "object-shorthand": "warn",
            "prefer-arrow-callback": "warn",
            "prefer-const": "warn",
            "prefer-destructuring": ["warn", { object: true, array: false }],
            "prefer-rest-params": "error",
            "prefer-spread": "warn",
            "prefer-template": "warn",
            "radix": "warn",
            "yoda": "warn",

            // ── Stylistic rules ────────────────────────────────────────
            "@stylistic/indent": ["warn", 4],
            "@stylistic/quotes": ["warn", "double", { avoidEscape: true }],
            "@stylistic/semi": ["warn", "always"],
            "@stylistic/comma-dangle": ["warn", "always-multiline"],
            "@stylistic/eol-last": ["warn", "always"],
            "@stylistic/no-trailing-spaces": "warn",
            "@stylistic/object-curly-spacing": ["warn", "always"],
            "@stylistic/array-bracket-spacing": ["warn", "never"],
            "@stylistic/arrow-spacing": "warn",
            "@stylistic/block-spacing": "warn",
            "@stylistic/comma-spacing": "warn",
            "@stylistic/key-spacing": "warn",
            "@stylistic/keyword-spacing": "warn",
            "@stylistic/space-before-blocks": "warn",
            "@stylistic/space-infix-ops": "warn",
            "@stylistic/no-multi-spaces": "warn",
            "@stylistic/no-multiple-empty-lines": ["warn", { max: 1 }],

            // ── TypeScript rules ────────────────────────────────────────
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-duplicate-enum-values": "error",
            "@typescript-eslint/no-inferrable-types": "warn",
            "@typescript-eslint/prefer-as-const": "warn",
        },
    },
);
