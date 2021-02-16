import {
    subDays,
    subMonths,
    subYears,
    subHours,
    eachDayOfInterval,
    getUnixTime,
    addMinutes,
    format as formatDate,
    startOfDay,
    eachHourOfInterval,
} from "date-fns";
import { chunk, first, last, mean, take, takeRight } from "lodash";
import { useEffect } from "react";
import { BalancerData, Period, TimePeriod } from "./api/datatypes";
import { dataExtractors } from "./routes/dashboard/state/hooks";

import bent from "bent";

export const BALANCER_CONTRACT_START_DATE = new Date(2020, 2, 29);
export const TODAY = new Date();

export const POST = (url: string) =>
    bent(url, "POST", "json", [200, 400, 404, 401, 500]);
export const GET = (url: string) =>
    bent(url, "GET", "json", [200, 400, 404, 401, 500])("");

export const getDates = (
    timePeriod: Partial<TimePeriod>,
    periodLength = 24,
    startDate?: Date
) => {
    let dates: any[] = [];
    const now = new Date();
    if (timePeriod.value === "hour") {
        dates = eachHourOfInterval({
            start: startDate || subHours(now, periodLength),
            end: now,
        }).map((date) => ({
            first_ten: getUnixTime(date),
            last_ten: getUnixTime(addMinutes(date, 10)),
            date: formatDate(date, "yyyy-MM-dd H:m"),
        }));
    } else if (timePeriod?.value === "day") {
        dates = eachDayOfInterval({
            start: startDate || BALANCER_CONTRACT_START_DATE,
            end: now,
        }).map((date) => ({
            first_ten: getUnixTime(date),
            last_ten: getUnixTime(addMinutes(date, 10)),
            date: formatDate(date, "yyyy-MM-dd"),
        }));
    }
    return dates;
};

export const getDynamicChange = (data: BalancerData[]) => (
    statistic: string
) => {
    const extractorFn = dataExtractors[statistic];

    const yesterday = extractorFn(data[0]) as number;
    const today = extractorFn(last(data)) as number;
    const change = (today - yesterday) / yesterday;
    return {
        yesterday,
        today,
        change,
        volume: today - yesterday,
    };
};

export const calculateLiquidityUtilisation = (
    data: BalancerData[],
    chunkSize = 24
) => {
    const liquidityExtractor = dataExtractors["totalLiquidity"];
    const swapVolumeExtractor = dataExtractors["totalSwapVolume"];

    const chunkedLiquidity = chunk(data.map(liquidityExtractor), chunkSize);
    const chunkedSwapVolume = chunk(data.map(swapVolumeExtractor), chunkSize);

    const liquidityMeans = chunkedLiquidity.map(mean);
    const volumeMovement = chunkedSwapVolume.map(
        (chunk: number[]) => last(chunk) - first(chunk)
    );

    const utilisations = liquidityMeans.map(
        (meanLiquidity, i) => volumeMovement[i] / meanLiquidity
    );
    const changes = utilisations.map((utilisation, i) => {
        if (i === utilisations.length - 1) return NaN;
        return (utilisations[i + 1] - utilisation) / utilisation;
    });

    return {
        data: utilisations,
        changes,
    };
};

export const calculateRevenueRatio = (data: BalancerData[], chunkSize = 24) => {
    const liquidityExtractor = dataExtractors["totalLiquidity"];
    const swapFeeVolumeExtractor = dataExtractors["totalSwapFeeVolume"];

    const chunkedLiquidity = chunk(data.map(liquidityExtractor), chunkSize);
    const chunkedSwapFeeVolume = chunk(
        data.map(swapFeeVolumeExtractor),
        chunkSize
    );

    const liquidityMeans = chunkedLiquidity.map(mean);
    const volumeMovement = chunkedSwapFeeVolume.map(
        (chunk: number[]) => last(chunk) - first(chunk)
    );

    const revenueRatios = liquidityMeans.map(
        (meanLiquidity, i) => volumeMovement[i] / meanLiquidity
    );
    const changes = revenueRatios.map((ratio, i) => {
        if (i === revenueRatios.length - 1) return NaN;
        return (revenueRatios[i + 1] - ratio) / ratio;
    });

    return {
        data: revenueRatios,
        changes,
    };
};

export function useOnClickOutside(
    ref: React.Ref<any>,
    handler: (event: Event) => void
) {
    useEffect(
        () => {
            const listener = (event: Event) => {
                // Do nothing if clicking ref's element or descendent elements
                if (
                    !(ref as any)?.current ||
                    (ref as any)?.current.contains(event.target)
                ) {
                    return;
                }

                handler(event);
            };

            document.addEventListener("mousedown", listener);
            document.addEventListener("touchstart", listener);

            return () => {
                document.removeEventListener("mousedown", listener);
                document.removeEventListener("touchstart", listener);
            };
        },
        // Add ref and handler to effect dependencies
        // It's worth noting that because passed in handler is a new ...
        // ... function on every render that will cause this effect ...
        // ... callback/cleanup to run every render. It's not a big deal ...
        // ... but to optimize you can wrap handler in useCallback before ...
        // ... passing it into this hook.
        [ref, handler]
    );
}

export const sortBlockKeys = (blockKeys: string[] = []) => {
    return blockKeys.sort((curr, next) => {
        const currBlockIndex = parseInt(curr.split("_")[1], 10);
        const nextBlockIndex = parseInt(next.split("_")[1], 10);

        if (currBlockIndex > nextBlockIndex) return 1;
        else if (currBlockIndex < nextBlockIndex) return -1;
        return 0;
    });
};

export const calculateChange = (originalValue: number, newValue: number) => {
    return (newValue - originalValue) / originalValue;
};

// using -1 as a mapping for unlimited, aka the max
const dayIntervalMap: Record<Period, number> = {
    "24h": 1,
    "2d": 2,
    "14d": 14,
    "60d": 60,
    "30d": 30,
    "7d": 7,
    "90d": 90,
    max: -1,
};

export const getIntervalBetweenPeriod = (period: Period) => {
    return dayIntervalMap[period];
};
