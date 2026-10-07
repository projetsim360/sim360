import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getApiOrigin, resolveAssetUrl } from '../../src/lib/asset-url';

test('production build with a relative API URL serves uploads from the same origin', () => {
  // Regression: the old `replace(...) || 'http://localhost:3001'` sent prod users to localhost.
  assert.equal(getApiOrigin('/api/v1'), '');
  assert.equal(resolveAssetUrl('/uploads/avatars/u1/a.png', '/api/v1'), '/uploads/avatars/u1/a.png');
});

test('absolute API URL keeps its origin', () => {
  assert.equal(getApiOrigin('http://localhost:3001/api/v1'), 'http://localhost:3001');
  assert.equal(getApiOrigin('https://api.example.com/api/v1/'), 'https://api.example.com');
  assert.equal(
    resolveAssetUrl('/uploads/avatars/u1/a.png', 'https://api.example.com/api/v1'),
    'https://api.example.com/uploads/avatars/u1/a.png',
  );
});

test('missing API URL falls back to the local API', () => {
  assert.equal(getApiOrigin(''), 'http://localhost:3001');
});

test('absolute, data and blob URLs are returned untouched; empty values give null', () => {
  assert.equal(resolveAssetUrl('https://lh3.googleusercontent.com/x', '/api/v1'), 'https://lh3.googleusercontent.com/x');
  assert.equal(resolveAssetUrl('data:image/png;base64,AAA', '/api/v1'), 'data:image/png;base64,AAA');
  assert.equal(resolveAssetUrl('blob:http://x/1', '/api/v1'), 'blob:http://x/1');
  assert.equal(resolveAssetUrl(null, '/api/v1'), null);
  assert.equal(resolveAssetUrl('', '/api/v1'), null);
});
