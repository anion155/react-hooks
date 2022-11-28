import { plugins } from "@monorepo/config/rollup";

/** @type {import('rollup').MergedRollupOptions[]} */
const config = [
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    plugins,
  },
];

export default config;
