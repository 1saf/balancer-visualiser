import { fromUnixTime, subDays } from "date-fns";
import { chunk, last } from "lodash";
import { value } from "numeral";
import React, { FC, useMemo, useState } from "react";
import { BalancerData, Period } from "../../api/datatypes";
import { DropdownOption } from "../../components/design/dropdown/Dropdown";
import Heading from "../../components/design/heading/Heading";
import Box from "../../components/layout/box/Box";
import LineGraph, { getSeries } from "../../components/ui/graph/LineGraph";
import LineGraphHeader from "../../components/ui/graph/LineGraphHeader";
import {
    BALANCER_CONTRACT_START_DATE,
    calculateLiquidityUtilisation,
    getDates,
    TODAY,
} from "../../utils";

import {
    useHistoricalBalancerState,
    DataExtractorFn,
    useEthTimestampBlocks,
    dataExtractors,
} from "./state/hooks";

type Props = {};

export const graphOptions = [
    {
        value: "liquidityUtilisation",
        label: "Liquidity Utilisation",
    },
    {
        value: "revenueRatio",
        label: "Revenue Ratio",
    },
];

export const useHistoricalUtilisationState = (
    extractor?: DataExtractorFn,
) => {
    // default to start at 24 hour
    const [graphTimePeriod, setGraphTimePeriod] = useState<Period>("30d");

    const {
        data: historicalBalancerData,
        isLoading: isLoadingHistoricalBalancerData,
    } = useHistoricalBalancerState(null, graphTimePeriod, true);

    let timestamps = chunk((historicalBalancerData as BalancerData[]), 24).map(b => last(b).timestamp);

    const values = useMemo(() => {
        return extractor(historicalBalancerData as BalancerData[], 24);
    }, [extractor, isLoadingHistoricalBalancerData === false, graphTimePeriod]);

    return {
        isLoading: isLoadingHistoricalBalancerData,
        values,
        setGraphTimePeriod,
        timestamps,
    };
};

const PeriodOptions = [
    { value: '7d', label: '7D' },
    { value: '30d', label: '30D' },
];

const HistoricalUtilisationGraph: FC<Props> = (props) => {
    const [dataKey, setDataKey] = useState(graphOptions[0]);

    const { isLoading, timestamps, values, setGraphTimePeriod } = useHistoricalUtilisationState(
        dataExtractors[dataKey?.value]
    );

    const movementData = (values?.changes || []).map((change, i) => {
        return [i, Math.abs(change), change > 0 ? 1 : -1];
    });

    const chartConfig = {
        series: [
            getSeries("line", dataKey.label, values.data, 0, "0.00%"),
            getSeries("bar", "Movement", movementData, 1),
        ],
        axis: timestamps,
    };

    return (
        <React.Fragment>
            <Box spanX={12}>
                <Heading level="5">Utilisation Metrics</Heading>
            </Box>
            <LineGraph
                headerRenderer={(ref) => (
                    <LineGraphHeader
                        dataFormat="0.00%"
                        isLoading={isLoading}
                        data={chartConfig}
                        onDataKeyChange={setDataKey}
                        dataOptions={graphOptions}
                        periodOptions={PeriodOptions}
                        ref={ref}
                        onPeriodChange={setGraphTimePeriod}
                    />
                )}
                isLoading={isLoading}
                data={chartConfig}
                title={dataKey.label}
                dataFormat="0.00%"
            />
        </React.Fragment>
    );
};

export default HistoricalUtilisationGraph;
