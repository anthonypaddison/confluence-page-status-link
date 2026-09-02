const CONTENT_ID_PATTERN = /^[1-9]\d*$/;

const contentIdFromPath = (url) => {
  const modernMatch = url.pathname.match(
    /^\/wiki\/spaces\/[^/]+\/pages\/([1-9]\d*)(?:\/|$)/,
  );

  if (modernMatch) {
    return modernMatch[1];
  }

  if (url.pathname !== '/wiki/pages/viewpage.action') {
    return null;
  }

  const contentId = url.searchParams.get('pageId');

  return CONTENT_ID_PATTERN.test(contentId || '') ? contentId : null;
};

export const parsePageReference = (value, siteHost) => {
  if (typeof value !== 'string' || typeof siteHost !== 'string' || !siteHost) {
    return null;
  }

  let url;

  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname.toLowerCase() !== siteHost.toLowerCase() ||
    url.port ||
    url.username ||
    url.password
  ) {
    return null;
  }

  const contentId = contentIdFromPath(url);

  if (!contentId) {
    return null;
  }

  return {
    contentId,
    url: `${url.pathname}${url.search}`,
  };
};

export const buildPageConfig = (value, siteUrl) => {
  let site;

  try {
    site = new URL(siteUrl);
  } catch {
    return null;
  }

  if (site.protocol !== 'https:' || site.port || site.username || site.password) {
    return null;
  }

  const reference = parsePageReference(value, site.hostname);

  if (!reference) {
    return null;
  }

  return {
    contentId: reference.contentId,
    targetUrl: `${site.origin}${reference.url}`,
  };
};
