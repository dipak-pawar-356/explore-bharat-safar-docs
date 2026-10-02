// Explore Bharat Safar — AST Architecture Boundaries Plugin
// Reference: EBS-BLU-49-REPO Section 7.2

import { noCrossDomainImports } from './rules/no-cross-domain-imports';
import { noDirectDbInWeb } from './rules/no-direct-db-in-web';
import { enforceRscClientBoundary } from './rules/enforce-rsc-client-boundary';
import { banDeepPackageImports } from './rules/ban-deep-package-imports';

export const rules = {
  'no-cross-domain-imports': noCrossDomainImports,
  'no-direct-db-in-web': noDirectDbInWeb,
  'enforce-rsc-client-boundary': enforceRscClientBoundary,
  'ban-deep-package-imports': banDeepPackageImports,
};

export const configs = {
  recommended: {
    plugins: ['ebs-boundaries'],
    rules: {
      'ebs-boundaries/no-cross-domain-imports': 'error',
      'ebs-boundaries/no-direct-db-in-web': 'error',
      'ebs-boundaries/enforce-rsc-client-boundary': 'warn',
      'ebs-boundaries/ban-deep-package-imports': 'error',
    },
  },
};

const plugin = {
  rules,
  configs,
};

export default plugin;
module.exports = plugin;
