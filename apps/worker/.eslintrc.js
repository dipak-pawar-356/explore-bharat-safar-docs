/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    '../../packages/config/eslint/base.js',
  ],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  root: false,
  env: {
    node: true,
  },
  ignorePatterns: ['.eslintrc.js', 'dist/'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
