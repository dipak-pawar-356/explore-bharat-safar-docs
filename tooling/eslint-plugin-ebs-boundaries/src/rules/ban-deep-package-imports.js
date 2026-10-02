"use strict";
// Explore Bharat Safar — Rule: ban-deep-package-imports
// Reference: EBS-BLU-49-REPO Section 7.2 & 11.2 (Barrel File Rule)
// Enforces package root imports only (@ebs/types vs @ebs/types/src/...)
Object.defineProperty(exports, "__esModule", { value: true });
exports.banDeepPackageImports = void 0;
exports.banDeepPackageImports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Enforce root package imports only and ban deep internal file imports',
            category: 'Architectural Boundaries',
            recommended: true,
        },
        schema: [],
        messages: {
            deepImportBanned: "Deep package import banned: '{{importPath}}'. Import exclusively from package root '{{packageRoot}}' via its public barrel export.",
        },
    },
    create(context) {
        return {
            ImportDeclaration(node) {
                const importPath = node.source.value;
                const match = importPath.match(/^(@ebs\/[^/]+)\/(src|dist)\//);
                if (match) {
                    context.report({
                        node,
                        messageId: 'deepImportBanned',
                        data: {
                            importPath,
                            packageRoot: match[1] ?? importPath,
                        },
                    });
                }
            },
        };
    },
};
