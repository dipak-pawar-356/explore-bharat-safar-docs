// Explore Bharat Safar — Rule: no-cross-domain-imports
// Reference: EBS-BLU-49-REPO Section 7.2 & 10.1
// Blocks modules inside apps/api/src/modules/<moduleA>/ from directly importing peer modules <moduleB>

import type { Rule } from 'eslint';
import * as path from 'node:path';

export const noCrossDomainImports: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prohibit direct cross-domain module imports inside apps/api/src/modules/',
      category: 'Architectural Boundaries',
      recommended: true,
    },
    schema: [],
    messages: {
      noCrossDomain:
        'Illegal cross-domain import: Domain module "{{currentDomain}}" cannot directly import peer domain module "{{targetDomain}}". Use contracts in @ebs/types or asynchronous domain events instead.',
    },
  },
  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/');
    const match = filename.match(/\/apps\/api\/src\/modules\/([^/]+)\//);
    if (!match) {
      return {};
    }

    const currentDomain = match[1];

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value as string;
        let targetDomain: string | null = null;

        if (importPath.startsWith('.')) {
          const fileDir = path.dirname(filename).replace(/\\/g, '/');
          const resolved = path.resolve(fileDir, importPath).replace(/\\/g, '/');
          const resolvedMatch = resolved.match(/\/apps\/api\/src\/modules\/([^/]+)/);
          if (resolvedMatch) {
            targetDomain = resolvedMatch[1];
          }
        } else {
          const aliasMatch =
            importPath.match(/^@\/modules\/([^/]+)/) || importPath.match(/^modules\/([^/]+)/);
          if (aliasMatch) {
            targetDomain = aliasMatch[1];
          }
        }

        if (targetDomain && targetDomain !== currentDomain && targetDomain !== 'common') {
          context.report({
            node,
            messageId: 'noCrossDomain',
            data: {
              currentDomain: currentDomain ?? 'unknown',
              targetDomain,
            },
          });
        }
      },
    };
  },
};
