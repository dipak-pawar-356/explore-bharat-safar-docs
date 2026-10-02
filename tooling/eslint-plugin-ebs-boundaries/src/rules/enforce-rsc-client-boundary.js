"use strict";
// Explore Bharat Safar — Rule: enforce-rsc-client-boundary
// Reference: EBS-BLU-49-REPO Section 7.2 & 3.2
// Verifies 'use client' presence when interactive client hooks or handlers are used
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforceRscClientBoundary = void 0;
const CLIENT_HOOKS = new Set([
    'useState',
    'useEffect',
    'useLayoutEffect',
    'useReducer',
    'useCallback',
    'useMemo',
    'useRef',
    'useContext',
    'useTransition',
    'useDeferredValue',
]);
exports.enforceRscClientBoundary = {
    meta: {
        type: 'problem',
        docs: {
            description: "Ensure 'use client' directive is present in components utilizing React hooks",
            category: 'Architectural Boundaries',
            recommended: true,
        },
        schema: [],
        messages: {
            missingUseClient: "RSC/Client Boundary Violation: File uses React hook '{{hookName}}' but lacks 'use client' directive at the top.",
        },
    },
    create(context) {
        const filename = context.getFilename().replace(/\\/g, '/');
        if (!filename.includes('/apps/web/src/')) {
            return {};
        }
        let hasUseClient = false;
        return {
            Program(node) {
                // Check for 'use client' directive in first statements/comments
                const firstStatement = node.body[0];
                if (firstStatement &&
                    firstStatement.type === 'ExpressionStatement' &&
                    firstStatement.expression.type === 'Literal' &&
                    firstStatement.expression.value === 'use client') {
                    hasUseClient = true;
                }
            },
            CallExpression(node) {
                if (hasUseClient)
                    return;
                if (node.callee.type === 'Identifier' && CLIENT_HOOKS.has(node.callee.name)) {
                    context.report({
                        node,
                        messageId: 'missingUseClient',
                        data: { hookName: node.callee.name },
                    });
                }
            },
        };
    },
};
