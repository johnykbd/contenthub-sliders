import { FunctionComponent, useEffect } from "react";
import { DefinitionQueryFilter } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/definition-query-filter";
import { ComparisonOperator } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/comparison-operator";
import { Query } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/query";
import { EntityLoadConfiguration } from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/entity-load-configuration";
import { IExtendedContentHubClient } from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client";

interface props {
  client: IExtendedContentHubClient;
}

const EntityCarousel: FunctionComponent<props> = ({ client }) => {
  useEffect(() => {
    checkResults().then(result => {
      console.log(result)
    })
  }, []);

  const checkResults = async () => {
    var definitionQueryFilter = new DefinitionQueryFilter({
      names: ["M.Collection"],
      operator: ComparisonOperator.Equals,
    });
    var query = new Query({
      filter: definitionQueryFilter,
      take:10
    });

    var result = await client.querying.queryAsync(
      query,
      EntityLoadConfiguration.Minimal
    );
    console.log("Total number of results: " + result.totalNumberOfResults)
    return result.totalNumberOfResults;
  };

  

  return <></>;
};

export default EntityCarousel;