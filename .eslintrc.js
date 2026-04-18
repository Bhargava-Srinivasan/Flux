module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  ignorePatterns: ['node_modules/', 'dist/', '.next/'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
};
