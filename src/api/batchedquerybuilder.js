import combineQuery from 'graphql-combine-query';

import gql from 'graphql-tag';

// UNCOMMENT FOR BUG RECREATION
import { take } from 'lodash';

onmessage = function(e) {
    const args = e.data;
    const query = combineQuery('CalculatedMetricsTimestamps').addN(gql`${args[0]}`, args[1]);
    postMessage(query);
}