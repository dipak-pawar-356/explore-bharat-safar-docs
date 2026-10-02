/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ['./base.js'],
  plugins: ['ebs-boundaries'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    'ebs-boundaries/no-cross-domain-imports': 'error',
    'ebs-boundaries/ban-deep-package-imports': 'error',
  },
};
