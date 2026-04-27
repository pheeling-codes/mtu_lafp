module.exports = {
  extends: ["eslint:recommended"],
  env: {
    node: true,
    es2022: true,
    browser: true
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    // Add custom shared rules here
  }
};
