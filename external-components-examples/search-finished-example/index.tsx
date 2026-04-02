import { createRoot } from "react-dom/client";
import SearchEventTest from "./SearchEvent";

interface Context {
  config: {
    searchComponentIdentifiers: Array<string>;
  };
  api: {
    search: {
      getEventSearchIdentifier: (searchIdentifier: string) => string;
    };
  };
}

export default function createExternalRoot(container: HTMLElement) {
  const root = createRoot(container);

  return {
    render(context: Context) {
      const { getEventSearchIdentifier } = context.api.search;

      root.render(
        <SearchEventTest
          searchComponentIdentifiers={context.config.searchComponentIdentifiers}
          getEventSearchIdentifier={getEventSearchIdentifier}
        />
      );
    },
    unmount() {
      root.unmount();
    },
  };
}
