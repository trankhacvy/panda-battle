import path from "node:path"

import { FlatCompat } from "@eslint/eslintrc"
import tailwind from "eslint-plugin-tailwindcss"
import { dirname } from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...tailwind.configs["flat/recommended"],
  ...compat.config({
    plugins: ["tailwindcss", "simple-import-sort", "prettier"],
    extends: ["next/core-web-vitals", "next/typescript", "prettier"],
    rules: {
      "prettier/prettier": "error",
      "no-restricted-properties": [
        "error",
        {
          object: "process",
          property: "env",
          message:
            "Do not use process.env directly — use object from env.ts instead",
        },
      ],
      "tailwindcss/classnames-order": "warn",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/enforces-negative-arbitrary-values": "warn",
      semi: ["off"],
      quotes: ["error", "double"],
      "prefer-arrow-callback": ["error"],
      "prefer-template": ["error"],
      "react-hooks/exhaustive-deps": ["off"],
      "no-console": [
        "warn",
        {
          allow: ["error"],
        },
      ],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "ignore" },
      ],
    },
    ignorePatterns: ["node_modules", ".next", "public"],
    settings: {
      tailwindcss: {
        config: path.join(__dirname, "tailwind.config.js"),
        callees: ["cn", "classnames"],
      },
    },
  }),
]

export default eslintConfig