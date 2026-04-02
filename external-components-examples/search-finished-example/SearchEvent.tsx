import { FunctionComponent, useEffect } from "react";

interface SearchInteractionProps {
  searchComponentIdentifiers: string[];
  getEventSearchIdentifier: (searchIdentifier: string) => string;
}

const SearchEvent: FunctionComponent<SearchInteractionProps> = ({
  searchComponentIdentifiers,
  getEventSearchIdentifier,
}) => {
  useEffect(() => {
    const onSearchFinished = (evt: Event): void => {
      console.log(evt);
      console.log("inside onSearchFinished");

      const { searchIdentifier: eventSearchIdentifier } = (
        evt as CustomEvent<{
          searchIdentifier: string;
        }>
      ).detail;

      searchComponentIdentifiers.forEach((identifier: string) => {
        let formattedIdentifier = getEventSearchIdentifier(identifier);

        if (eventSearchIdentifier === formattedIdentifier) {
          console.log("found search component");
          return;
        }
      });
    };

    console.log("ADDING  onSearchFinished");
    window.addEventListener("SEARCH_FINISHED", onSearchFinished);

    return () => {
      console.log("REMOVING onSearchFinished");
      window.removeEventListener("SEARCH_FINISHED", onSearchFinished);
    };
  }, []);

  return <></>;
};

export default SearchEvent;
