import test from 'node:test';
import assert from 'node:assert/strict';

import { loadPageStatus } from '../src/lib/page-status.js';

const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });

const requestFor = (contentResponse, stateResponse) => async (uri) =>
  uri.endsWith('/state') ? stateResponse : contentResponse;

test('returns permitted page metadata and its current state', async () => {
  const result = await loadPageStatus(
    '123',
    requestFor(
      jsonResponse({
        id: '123',
        type: 'page',
        title: 'Release policy',
        _links: { webui: '/spaces/OPS/pages/123/Release+policy' },
      }),
      jsonResponse({ contentState: { id: 7, name: 'Approved', color: 'GREEN' } }),
    ),
  );

  assert.deepEqual(result, {
    kind: 'available',
    title: 'Release policy',
    href: '/wiki/spaces/OPS/pages/123/Release+policy',
    status: 'Approved',
  });
});

test('returns No status when a permitted page has no assigned state', async () => {
  const result = await loadPageStatus(
    '123',
    requestFor(
      jsonResponse({
        id: '123',
        type: 'page',
        title: 'Draft notes',
        _links: { webui: '/spaces/OPS/pages/123/Draft+notes' },
      }),
      jsonResponse({ message: 'No state' }, 404),
    ),
  );

  assert.equal(result.kind, 'available');
  assert.equal(result.status, 'No status');
});

test('returns No status when the permitted state response has a null content state', async () => {
  const result = await loadPageStatus(
    '123',
    requestFor(
      jsonResponse({
        id: '123',
        type: 'page',
        title: 'Draft notes',
        _links: { webui: '/spaces/OPS/pages/123/Draft+notes' },
      }),
      jsonResponse({ contentState: null }),
    ),
  );

  assert.deepEqual(result, {
    kind: 'available',
    title: 'Draft notes',
    href: '/wiki/spaces/OPS/pages/123/Draft+notes',
    status: 'No status',
  });
});

test('fails closed for denied, missing, or failed content reads', async () => {
  for (const status of [401, 403, 404, 429, 500]) {
    const result = await loadPageStatus(
      '123',
      requestFor(jsonResponse({ message: 'hidden' }, status), jsonResponse({})),
    );
    assert.deepEqual(result, { kind: 'unavailable' });
  }
});

test('fails closed for denied or failed state reads', async () => {
  for (const status of [401, 403, 429, 500]) {
    const result = await loadPageStatus(
      '123',
      requestFor(
        jsonResponse({
          id: '123',
          type: 'page',
          title: 'Secret policy',
          _links: { webui: '/spaces/OPS/pages/123/Secret+policy' },
        }),
        jsonResponse({ message: 'hidden' }, status),
      ),
    );
    assert.deepEqual(result, { kind: 'unavailable' });
  }
});

test('fails closed for invalid JSON and unexpected success shapes', async () => {
  const cases = [
    requestFor(new Response('not json'), jsonResponse({})),
    requestFor(jsonResponse({ id: 'other', type: 'page', title: 'Wrong' }), jsonResponse({})),
    requestFor(
      jsonResponse({ id: '123', type: 'blogpost', title: 'Wrong' }),
      jsonResponse({}),
    ),
    requestFor(
      jsonResponse({ id: '123', type: 'page', title: '', _links: { webui: '/x' } }),
      jsonResponse({}),
    ),
    requestFor(
      jsonResponse({
        id: '123',
        type: 'page',
        title: 'Page',
        _links: { webui: 'https://evil.example/page' },
      }),
      jsonResponse({}),
    ),
    requestFor(
      jsonResponse({
        id: '123',
        type: 'page',
        title: 'Page',
        _links: { webui: '/spaces/OPS/pages/123/Page' },
      }),
      new Response('not json'),
    ),
  ];

  for (const request of cases) {
    assert.deepEqual(await loadPageStatus('123', request), {
      kind: 'unavailable',
    });
  }
});

test('fails closed before requesting when the ID or request function is invalid', async () => {
  assert.deepEqual(await loadPageStatus('0', async () => jsonResponse({})), {
    kind: 'unavailable',
  });
  assert.deepEqual(await loadPageStatus('123', null), { kind: 'unavailable' });
});
