/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
  setupFilesAfterEnv: ['<rootDir>/prisma/singleton.js'],
  globalTeardown: './src/test/teardown.js',
};
