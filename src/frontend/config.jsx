import React, { useEffect, useState } from 'react';
import ForgeReconciler, {
  Button,
  Label,
  SectionMessage,
  Stack,
  Text,
  Textfield,
} from '@forge/react';
import { view } from '@forge/bridge';

import { buildPageConfig } from '../lib/page-reference.js';

const Config = () => {
  const [targetUrl, setTargetUrl] = useState('');
  const [siteUrl, setSiteUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    view
      .getContext()
      .then((context) => {
        setTargetUrl(context.extension?.config?.targetUrl || '');
        setSiteUrl(context.siteUrl || '');
      })
      .catch(() => setError('Configuration is unavailable.'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    const config = buildPageConfig(targetUrl, siteUrl);

    if (!config) {
      setError('Enter a page URL from this Confluence site.');
      return;
    }

    setError('');

    try {
      await view.submit({ config });
    } catch {
      setError('The page link could not be saved. Try again.');
    }
  };

  if (loading) {
    return <Text>Loading configuration…</Text>;
  }

  return (
    <Stack space="space.200">
      <Label labelFor="targetUrl">Confluence page URL</Label>
      <Textfield
        id="targetUrl"
        value={targetUrl}
        placeholder={`${siteUrl}/wiki/spaces/SPACE/pages/123/Page`}
        onChange={(event) => setTargetUrl(event.target.value)}
      />
      <Text>Paste a page URL from this site. Restricted pages remain hidden from viewers without access.</Text>
      {error && (
        <SectionMessage appearance="error">
          <Text>{error}</Text>
        </SectionMessage>
      )}
      <Button appearance="primary" onClick={submit}>
        Save
      </Button>
    </Stack>
  );
};

ForgeReconciler.render(<Config />);
