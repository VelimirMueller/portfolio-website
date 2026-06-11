/**
 * Conventional commits, enforced at commit time via the husky commit-msg
 * hook. History before v1.2.8 predates this gate.
 * Format: type(scope?): subject — e.g. "fix(contact): validate payload"
 */
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
