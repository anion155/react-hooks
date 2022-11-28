const jestConfig = require("@anion155/eslint-config/jest");

/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: [
    "@anion155",
    "plugin:import/typescript"
  ],
  parserOptions: {
    project: "./tsconfig.json",
  },
  overrides: [jestConfig({})],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "warn",
      {
        varsIgnorePattern: "[iI]gnored",
        argsIgnorePattern: "^_",
        caughtErrorsIgnorePattern: "^ignore",
      },
    ],
    "import/no-extraneous-dependencies": "off"
  },
};
