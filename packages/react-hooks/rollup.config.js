import { plugins } from "@monorepo/config/rollup";

/** @type {import('rollup').MergedRollupOptions[]} */
const config = [
  {
    input: "src/utils/index.ts",
    output: {
      file: "dist/utils.js",
      format: "cjs",
      sourcemap: true,
    },
    plugins,
  },
  {
    input: "src/index.ts",
    output: {
      file: "dist/index.js",
      format: "cjs",
      sourcemap: true,
    },
    external: ["./utils"],
    plugins,
  },
];

export default config;
