import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { sha256 } from '../src/lib/sha256.js';

const real = s => createHash('sha256').update(s).digest('hex');

test('matches the standard SHA-256 for known inputs', () => {
  assert.equal(sha256('hello'), '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  assert.equal(sha256(''), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
});

test('matches the standard SHA-256 around block boundaries and in Thai and Burmese', () => {
  const inputs = ['Hello', 'สวัสดี', 'မင်္ဂလာပါ', 'x'.repeat(1000)];
  for (let n = 50; n <= 130; n++) inputs.push('a'.repeat(n));
  for (const s of inputs) assert.equal(sha256(s), real(s), `length ${s.length}`);
});
