"use strict";
// Explore Bharat Safar — AST Architecture Boundaries Plugin
// Reference: EBS-BLU-49-REPO Section 7.2
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.rules = void 0;
const no_cross_domain_imports_1 = require("./rules/no-cross-domain-imports");
const no_direct_db_in_web_1 = require("./rules/no-direct-db-in-web");
const enforce_rsc_client_boundary_1 = require("./rules/enforce-rsc-client-boundary");
const ban_deep_package_imports_1 = require("./rules/ban-deep-package-imports");
exports.rules = {
    'no-cross-domain-imports': no_cross_domain_imports_1.noCrossDomainImports,
    'no-direct-db-in-web': no_direct_db_in_web_1.noDirectDbInWeb,
    'enforce-rsc-client-boundary': enforce_rsc_client_boundary_1.enforceRscClientBoundary,
    'ban-deep-package-imports': ban_deep_package_imports_1.banDeepPackageImports,
};
exports.configs = {
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
    rules: exports.rules,
    configs: exports.configs,
};
exports.default = plugin;
module.exports = plugin;
