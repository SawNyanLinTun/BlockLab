import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shift } from '../src/lib/util.js';

test('shift encrypts and decrypts', () => {
  assert.equal(shift('HELLO', 3), 'KHOOR');
  assert.equal(shift('KHOOR', -3), 'HELLO');
  assert.equal(shift('xyz', 3), 'ABC');
  assert.equal(shift('Meet me!', 0), 'MEET ME!');
});

test('the lesson examples decode correctly', () => {
  assert.equal(shift('AOPZ PZ LHZF', -7), 'THIS IS EASY');
  assert.equal(shift('TLLA TL HA AOL SPIYHYF', -7), 'MEET ME AT THE LIBRARY');
});
