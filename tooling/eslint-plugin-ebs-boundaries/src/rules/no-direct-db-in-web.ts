// Explore Bharat Safar — Rule: no-direct-db-in-web
// Reference: EBS-BLU-49-REPO Section 7.2 & 11.2
// Blocks apps/web from importing packages/database or @ebs/database

import type { Rule } from 'eslint';

export const noDirectDbInWeb: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prohibit apps/web from directly importing @ebs/database or database clients',
      category: 'Architectural Boundaries',
      recommended: true,
    },
    schema: [],
    messages: {
      noDbInWeb:
        'Frontend-to-Database Firewall Breach: apps/web is strictly prohibited from importing {{source}}. All data ingestion must execute via HTTP REST APIs or BFF endpoints.',
    },
  },
  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/');
    if (!filename.includes('/apps/web/')) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value as string;
        if (
          importPath === '@ebs/database' ||
          importPath.startsWith('@ebs/database/') ||
          importPath.includes('packages/database') ||
          importPath === '@prisma/client' ||
          importPath.startsWith('@prisma/client/')
        ) {
          context.report({
            node,
            messageId: 'noDbInWeb',
            data: {
              source: importPath,
            },
          });
        }
      },
    };
  },
};
