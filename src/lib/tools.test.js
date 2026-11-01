import test from 'node:test';
import assert from 'node:assert/strict';
import { TOOLS, resolveTool } from './tools.js';

test('alat yang bisa dipilih: effectcraft, remotion, hyperframes — semuanya dengan opendesign', () => {
  assert.deepEqual(
    TOOLS.map((t) => t.id),
    ['effectcraft', 'remotion', 'hyperframes'],
  );
  assert.deepEqual(
    TOOLS.map((t) => t.label),
    ['effectcraft-from-opendesign', 'remotion-from-opendesign', 'hyperframes-from-opendesign'],
  );
  for (const tool of TOOLS) {
    assert.ok(tool.title && tool.directive, tool.id);
    assert.ok(tool.directive.includes(tool.label), `${tool.id} memakai namanya sendiri di direktif`);
    assert.equal(resolveTool(tool.id), tool);
  }
  assert.equal(resolveTool('veo'), TOOLS[0]);
  assert.equal(resolveTool(undefined), TOOLS[0]);
});