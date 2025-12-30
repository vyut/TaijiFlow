module.exports = {
  // Test environment
  testEnvironment: "node",

  // Test file patterns
  testMatch: ["**/tests/**/*.test.js"],

  // Module paths for resolving imports
  moduleDirectories: ["node_modules", "js"],

  // Coverage configuration
  collectCoverageFrom: [
    "js/**/*.js",
    "!js/translations.js", // Exclude translations (data only)
  ],

  // Verbose output
  verbose: true,
};
