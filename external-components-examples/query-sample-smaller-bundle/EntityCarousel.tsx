import {FC, useCallback, useEffect, useMemo, useState} from "react";
import {
    DefinitionQueryFilter
} from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/definition-query-filter";
import {
    ComparisonOperator
} from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/filters/comparison-operator";
import {Query} from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/query";
import {
    EntityLoadConfiguration
} from "@sitecore/sc-contenthub-webclient-sdk/dist/contracts/querying/entity-load-configuration";
import {IExtendedContentHubClient} from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/extended-client";
import {QueryingClient} from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/querying-client";
import {ContentHubClient} from "@sitecore/sc-contenthub-webclient-sdk/dist/clients/content-hub-client";

interface props {
    clientBuilder: (constructor?: typeof ContentHubClient) => IExtendedContentHubClient;
}

const query = new Query({
    filter: new DefinitionQueryFilter({
        names: ["M.Collection"],
        operator: ComparisonOperator.Equals,
    }),
    take: 10
});

const EntityCarousel: FC<props> = ({clientBuilder}) => {
    const [totalNrItems, setTotalNrItems] = useState(0);
    const queryClient = useMemo(
        () => new QueryingClient(clientBuilder()),
        [clientBuilder]);

    /**
     * Alternatively, you can use the following code to create the client:
     *
     * const client = clientBuilder(ContentHubClient);
     *
     * and then use client.querying.queryAsync to execute the query.
     * Please mind that using client.querying.queryAsync results in a larger bundle size.
     * So, if bundle size matters to you, use the QueryingClient instead.
     */

    useEffect(() => {
        let cancelCallback: ((reason?: (string | undefined)) => void) | undefined;

        void queryClient.queryAsync(
            query,
            EntityLoadConfiguration.Minimal,
            cancelToken => {
                cancelCallback = cancelToken;
            }
        ).then(({totalNumberOfResults}) => {
            setTotalNrItems(totalNumberOfResults);
        }).catch(error => {
            if (error.code !== "ERR_CANCELED") {
                throw error;
            }
        });

        return () => {
            cancelCallback?.("canceled");
        };
    }, [queryClient.queryAsync]);

    return <>Total number of items is: {totalNrItems}</>;
};

export default EntityCarousel;