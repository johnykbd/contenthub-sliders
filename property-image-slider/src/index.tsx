import React from 'react';
import { createRoot } from 'react-dom/client';
import { ContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client';
import { IExtendedContentHubClient } from '@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client';
import ImageSlider from './ImageSlider';

export default function createExternalRoot(
  container: HTMLElement,
  clientBuilder: (constructor?: typeof ContentHubClient) => IExtendedContentHubClient
) {
  const client = clientBuilder(ContentHubClient);
  const root = createRoot(container);

  return {
    render(context: any) {
      root.render(
        <ImageSlider
          entity={context.entity}
          client={client}
          entityId={context.options?.entityId}
          config={context.config}
        />
      );
    },
    unmount() {
      root.unmount();
    },
  };
}
