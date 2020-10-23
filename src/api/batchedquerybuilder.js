import combineQuery from 'graphql-combine-query';

import gql from 'graphql-tag';

onmessage = function(e) {
    const args = e.data;
    const query = combineQuery('CalculatedMetricsTimestamps').addN(gql`${args[0]}`, args[1]);
    postMessage(query);
}