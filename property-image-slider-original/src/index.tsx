import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client';
import { IExtendedContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client';
import ImageSliderOriginal from './ImageSliderOriginal';

export default function createExternalRoot(
  container: HTMLElement,
  clientBuilder: (constructor?: typeof ContentHubClient) => IExtendedContentHubClient
) {
  clientBuilder(ContentHubClient); // initialise authenticated client (available for future use)
  const root = createRoot(container);

  return {
    render(context: any) {
      const urls: string[] =
        context?.entity?.properties?.PropertyImagesOrg?.Invariant?.urls ?? [];

      root.render(
        <ImageSliderOriginal
          images={urls}
          title={context?.config?.title ?? 'Images (Original)'}
        />
      );
    },
    unmount() {
      root.unmount();
    },
  };
}
