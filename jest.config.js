module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'netlify/functions/**/*.js',
    '!netlify/functions/__tests__/**',
  ],
  moduleFileExtensions: ['js', 'json'],
  verbose: true,
};
