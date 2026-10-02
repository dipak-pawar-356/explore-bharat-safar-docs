"use strict";
// Explore Bharat Safar — Rule: no-cross-domain-imports
// Reference: EBS-BLU-49-REPO Section 7.2 & 10.1
// Blocks modules inside apps/api/src/modules/<moduleA>/ from directly importing peer modules <moduleB>
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.noCrossDomainImports = void 0;
const path = __importStar(require("node:path"));
exports.noCrossDomainImports = {
    meta: {
        type: 'problem',
        docs: {
            description: 'Prohibit direct cross-domain module imports inside apps/api/src/modules/',
            category: 'Architectural Boundaries',
            recommended: true,
        },
        schema: [],
        messages: {
            noCrossDomain: 'Illegal cross-domain import: Domain module "{{currentDomain}}" cannot directly import peer domain module "{{targetDomain}}". Use contracts in @ebs/types or asynchronous domain events instead.',
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
                const importPath = node.source.value;
                let targetDomain = null;
                if (importPath.startsWith('.')) {
                    const fileDir = path.dirname(filename).replace(/\\/g, '/');
                    const resolved = path.resolve(fileDir, importPath).replace(/\\/g, '/');
                    const resolvedMatch = resolved.match(/\/apps\/api\/src\/modules\/([^/]+)/);
                    if (resolvedMatch) {
                        targetDomain = resolvedMatch[1];
                    }
                }
                else {
                    const aliasMatch = importPath.match(/^@\/modules\/([^/]+)/) || importPath.match(/^modules\/([^/]+)/);
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
