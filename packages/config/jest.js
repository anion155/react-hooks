/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.json",
      },
    ],
  },
  testMatch: ["**/__tests__/**/?(*.)+(spec|test).[jt]s?(x)"],
  clearMocks: true,
  globals: {
    __DEV__: true,
  },
};
