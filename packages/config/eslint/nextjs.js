/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: [
    './base.js',
  ],
  plugins: ['ebs-boundaries'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'ebs-boundaries/no-direct-db-in-web': 'error',
    'ebs-boundaries/enforce-rsc-client-boundary': 'warn',
    'ebs-boundaries/ban-deep-package-imports': 'error',
  },
};
