const commonjs = require("@rollup/plugin-commonjs").default;
const nodeResolve = require("@rollup/plugin-node-resolve").default;
const replace = require("@rollup/plugin-replace").default;
const typescript = require("@rollup/plugin-typescript").default;
const external = require("rollup-plugin-peer-deps-external");

/** @type {import('rollup').Plugin[]} */
const plugins = [
  external({ includeDependencies: true }),
  replace({
    preventAssignment: true,
    values: {
      __DEV__: "(process.env.NODE_ENV !== 'production')",
    },
  }),
  typescript({ tsconfig: "./tsconfig.build.json" }),
  nodeResolve(),
  commonjs(),
];
exports.plugins = plugins;
