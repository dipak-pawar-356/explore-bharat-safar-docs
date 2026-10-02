"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Explore Bharat Safar — Architectural Boundaries Linter Test Suite
const node_test_1 = require("node:test");
const strict_1 = __importDefault(require("node:assert/strict"));
const index_1 = require("./index");
(0, node_test_1.describe)('Architecture Boundary Rules Registry', () => {
    (0, node_test_1.it)('should export all 4 mandatory boundary rules', () => {
        strict_1.default.ok(index_1.rules['no-cross-domain-imports'], 'no-cross-domain-imports rule exists');
        strict_1.default.ok(index_1.rules['no-direct-db-in-web'], 'no-direct-db-in-web rule exists');
        strict_1.default.ok(index_1.rules['enforce-rsc-client-boundary'], 'enforce-rsc-client-boundary rule exists');
        strict_1.default.ok(index_1.rules['ban-deep-package-imports'], 'ban-deep-package-imports rule exists');
    });
    (0, node_test_1.it)('should have problem type metadata on each rule', () => {
        for (const [name, rule] of Object.entries(index_1.rules)) {
            strict_1.default.equal(rule.meta?.type, 'problem', `Rule ${name} has type problem`);
            strict_1.default.ok(rule.create, `Rule ${name} has create method`);
        }
    });
});
