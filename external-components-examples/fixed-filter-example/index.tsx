import ReactDOM from "react-dom";
import { FieldFilterRequestResource } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/field-filter-request-resource";
import { SearchRequest } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/search-request";
import { RequestedFilterType } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/requested-filter-type";
import { FilterOperator } from "@sitecore/sc-contenthub-webclient-sdk/dist/models/search/filter-operator";

function deepEqual(obj1: any, obj2: any): boolean {
    return JSON.stringify(obj1) === JSON.stringify(obj2);
}

export default function createExternalRoot(container: HTMLElement) {
  return {
    render(context: any) {
      
    const disposeFuncs: Array<Function> = [];

    const extraFilters: FieldFilterRequestResource = (
            {
            fieldName: "taxonomy_items.64.*",
            values: [1025],
            nestedValues: [],
            operator: FilterOperator.AnyOf,
            visible: true,
            hidden: true,
            role: "Parent",
            multiSelect: true,
            filterType: RequestedFilterType.InFilter,         
          });
      
    const disposeFunc = context.api.search.addListener(
      context.config.searchIdentifier,
      "BEFORE_SEARCH",
      ({searchRequest}:{searchRequest:SearchRequest         
        }) => {
          console.log(searchRequest.fieldFilters);


          if (Array.isArray(searchRequest.fieldFilters) && !searchRequest.fieldFilters.some(filter => deepEqual(filter, extraFilters))) {
              searchRequest.fieldFilters.push(extraFilters);
          }
        }
    );

    disposeFuncs.push(disposeFunc);

    context.api.search.activate(context.config.searchIdentifier);

    },
    unmount() {
      ReactDOM.unmountComponentAtNode(container);
    },
  };
}
