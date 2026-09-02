const CONTENT_ID_PATTERN = /^[1-9]\d*$/;
const UNAVAILABLE = Object.freeze({ kind: 'unavailable' });

const safeJson = async (response) => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const relativePageHref = (webui) => {
  if (typeof webui !== 'string' || !webui.startsWith('/') || webui.startsWith('//')) {
    return null;
  }

  return webui.startsWith('/wiki/') ? webui : `/wiki${webui}`;
};

export const loadPageStatus = async (contentId, request) => {
  if (!CONTENT_ID_PATTERN.test(contentId || '') || typeof request !== 'function') {
    return UNAVAILABLE;
  }

  let contentResponse;
  let stateResponse;

  try {
    [contentResponse, stateResponse] = await Promise.all([
      request(`/wiki/api/v2/pages/${contentId}`, {
        headers: { Accept: 'application/json' },
      }),
      request(`/wiki/rest/api/content/${contentId}/state`, {
        headers: { Accept: 'application/json' },
      }),
    ]);
  } catch {
    return UNAVAILABLE;
  }

  if (!contentResponse?.ok) {
    return UNAVAILABLE;
  }

  const content = await safeJson(contentResponse);
  const title = typeof content?.title === 'string' ? content.title.trim() : '';
  const href = relativePageHref(content?._links?.webui);

  if (
    content?.id !== contentId ||
    !title ||
    !href
  ) {
    return UNAVAILABLE;
  }

  if (stateResponse?.status === 404) {
    return { kind: 'available', title, href, status: 'No status' };
  }

  if (!stateResponse?.ok) {
    return UNAVAILABLE;
  }

  const state = await safeJson(stateResponse);

  if (state && state.contentState == null) {
    return { kind: 'available', title, href, status: 'No status' };
  }

  const status =
    typeof state?.contentState?.name === 'string'
      ? state.contentState.name.trim()
      : '';

  if (!status) {
    return UNAVAILABLE;
  }

  return { kind: 'available', title, href, status };
};
