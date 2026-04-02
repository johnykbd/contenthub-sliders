import { createRoot } from "react-dom/client";
import { ContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client";
import EntityCarousel from "./EntityCarousel";
import { IExtendedContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client";

export default function createExternalRoot(
  container: HTMLElement,
  clientBuilder: (constructor?: typeof ContentHubClient) => IExtendedContentHubClient
) {
  const root = createRoot(container);

  return {
    render() {
      root.render(<EntityCarousel clientBuilder={clientBuilder} />);
    },
    unmount() {
      root.unmount;
    },
  };
}