import { createRoot } from "react-dom/client";
import { ContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client";
import EntityCarousel from "./EntityCarousel";
import { IExtendedContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client";

interface Context {
  options: {
    entityId: number | undefined;
  };
  user: {
    userGroups: Array<string>;
  };
  client: ContentHubClient;
}

export default function createExternalRoot(
  container: HTMLElement,
  clientBuilder: (constructor: typeof ContentHubClient) => IExtendedContentHubClient
) {
  const client = clientBuilder(ContentHubClient);
  var root = createRoot(container);

  return {
    render() {
      root.render(<EntityCarousel client={client} />);
    },
    unmount() {
      root.unmount;
    },
  };
}