import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Inline,
  Link,
  Lozenge,
  Text,
  useConfig,
  useProductContext,
} from '@forge/react';
import { requestConfluence } from '@forge/bridge';

import { loadPageStatus } from '../lib/page-status.js';

const App = () => {
  const config = useConfig();
  const context = useProductContext();
  const [page, setPage] = useState({ kind: 'loading' });
  const contentId = config?.contentId;

  useEffect(() => {
    let active = true;

    if (!contentId || !context?.siteUrl) {
      setPage({ kind: contentId ? 'loading' : 'unconfigured' });
      return () => {
        active = false;
      };
    }

    setPage({ kind: 'loading' });
    loadPageStatus(contentId, requestConfluence).then((result) => {
      if (active) {
        setPage(result);
      }
    });

    return () => {
      active = false;
    };
  }, [contentId, context?.siteUrl]);

  if (page.kind === 'unconfigured') {
    return (
      <Text as="span" color="color.text.subtle">
        Configure Page Status Link
      </Text>
    );
  }

  if (page.kind === 'loading') {
    return (
      <Text as="span" color="color.text.subtle">
        Loading page status…
      </Text>
    );
  }

  if (page.kind !== 'available') {
    return (
      <Text as="span" color="color.text.subtle">Page unavailable</Text>
    );
  }

  return (
    <Inline alignBlock="center" space="space.050">
      <Link href={page.href}>{page.title}</Link>
      <Lozenge>{page.status}</Lozenge>
    </Inline>
  );
};

ForgeReconciler.render(<App />);
