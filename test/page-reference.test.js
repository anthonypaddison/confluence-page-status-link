import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPageConfig,
  parsePageReference,
} from '../src/lib/page-reference.js';

const siteHost = 'example.atlassian.net';

test('extracts a stable ID from a modern same-site Confluence page URL', () => {
  assert.deepEqual(
    parsePageReference(
      'https://example.atlassian.net/wiki/spaces/TEST/pages/123456/Page+Title',
      siteHost,
    ),
    {
      contentId: '123456',
      url: '/wiki/spaces/TEST/pages/123456/Page+Title',
    },
  );
});

test('accepts a positive single-digit content ID', () => {
  assert.equal(
    parsePageReference(
      'https://example.atlassian.net/wiki/spaces/TEST/pages/1/Page',
      siteHost,
    ).contentId,
    '1',
  );
});

test('extracts a stable ID from a legacy same-site page URL', () => {
  assert.deepEqual(
    parsePageReference(
      'https://example.atlassian.net/wiki/pages/viewpage.action?pageId=98765',
      siteHost,
    ),
    {
      contentId: '98765',
      url: '/wiki/pages/viewpage.action?pageId=98765',
    },
  );
});

test('rejects unsafe or non-page references', () => {
  for (const value of [
    undefined,
    '',
    'not a URL',
    'http://example.atlassian.net/wiki/spaces/TEST/pages/1/Page',
    'https://other.atlassian.net/wiki/spaces/TEST/pages/1/Page',
    'https://example.atlassian.net/wiki/spaces/TEST/overview',
    'https://example.atlassian.net/wiki/pages/viewpage.action?pageId=abc',
    'https://example.atlassian.net/wiki/spaces/TEST/pages/0/Page',
  ]) {
    assert.equal(parsePageReference(value, siteHost), null);
  }
});

test('rejects an unavailable site host', () => {
  assert.equal(
    parsePageReference(
      'https://example.atlassian.net/wiki/spaces/TEST/pages/1/Page',
      '',
    ),
    null,
  );
});

test('builds stable macro configuration from the current site URL', () => {
  assert.deepEqual(
    buildPageConfig(
      'https://example.atlassian.net/wiki/spaces/TEST/pages/123/Page',
      'https://example.atlassian.net',
    ),
    {
      contentId: '123',
      targetUrl:
        'https://example.atlassian.net/wiki/spaces/TEST/pages/123/Page',
    },
  );
});

test('rejects macro configuration when the site or target URL is invalid', () => {
  assert.equal(buildPageConfig('not a URL', 'https://example.atlassian.net'), null);
  assert.equal(buildPageConfig('https://example.atlassian.net/wiki/spaces/X/pages/1/P', ''), null);
});
