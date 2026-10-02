// Explore Bharat Safar — Architectural Boundaries Linter Test Suite
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { rules } from './index';

describe('Architecture Boundary Rules Registry', () => {
  it('should export all 4 mandatory boundary rules', () => {
    assert.ok(rules['no-cross-domain-imports'], 'no-cross-domain-imports rule exists');
    assert.ok(rules['no-direct-db-in-web'], 'no-direct-db-in-web rule exists');
    assert.ok(rules['enforce-rsc-client-boundary'], 'enforce-rsc-client-boundary rule exists');
    assert.ok(rules['ban-deep-package-imports'], 'ban-deep-package-imports rule exists');
  });

  it('should have problem type metadata on each rule', () => {
    for (const [name, rule] of Object.entries(rules)) {
      assert.equal(rule.meta?.type, 'problem', `Rule ${name} has type problem`);
      assert.ok(rule.create, `Rule ${name} has create method`);
    }
  });
});
