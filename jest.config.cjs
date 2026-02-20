const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // setupFilesAfterEnv: ['<rootDir>/__tests__/integration_tests/setup.ts'],

  testMatch: [
    '**/__tests__/**/*.spec.ts',
    '**/?(*.)+(spec|test).ts'
  ],

  setupFiles: ['dotenv/config'],

  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  verbose: true,
};