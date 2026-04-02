import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client';
import { IExtendedContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client';
import VideoSliderOriginal from './VideoSliderOriginal';

export default function createExternalRoot(
  container: HTMLElement,
  clientBuilder: (constructor?: typeof ContentHubClient) => IExtendedContentHubClient
) {
  clientBuilder(ContentHubClient);
  const root = createRoot(container);

  return {
    render(context: any) {
      const urls: string[] =
        context?.entity?.properties?.PropertyVideosOrg?.Invariant?.urls ?? [];

      root.render(
        <VideoSliderOriginal
          videos={urls}
          title={context?.config?.title ?? 'Videos (Original)'}
        />
      );
    },
    unmount() {
      root.unmount();
    },
  };
}
