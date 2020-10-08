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
} from 'date-fns';
import { chunk, first, last, mean, take, takeRight } from 'lodash';
import { useEffect } from 'react';
import { BalancerData, TimePeriod } from './api/datatypes';
import { dataExtractors } from './routes/dashboard/state/hooks';

export const BALANCER_CONTRACT_START_DATE = new Date(2020, 2, 29);
export const TODAY = new Date();

export const getDates = (timePeriod: Partial<TimePeriod>, periodLength = 24, startDate?: Date) => {
    let dates: any[] = [];
    const today = new Date();
    if (timePeriod.value === 'hourly') {
        dates = eachHourOfInterval({
            start: startDate || subHours(today, 24),
            end: today,
        }).map(date => ({
            first_ten: getUnixTime(date),
            last_ten: getUnixTime(addMinutes(date, 10)),
            date: formatDate(date, 'yyyy-MM-dd'),
        }));
    } else if (timePeriod?.value === 'daily') {
        dates = eachDayOfInterval({
            start: startDate || BALANCER_CONTRACT_START_DATE,
            end: today,
        }).map(date => ({
            first_ten: getUnixTime(date),
            last_ten: getUnixTime(addMinutes(date, 10)),
            date: formatDate(date, 'yyyy-MM-dd'),
        }));
    }
    return dates;
};

export const get24Change = (data: BalancerData[]) => (statistic: string) => {
    const extractorFn = dataExtractors[statistic];
    const yesterday = extractorFn(data[24]) - extractorFn(data[0]);
    const today = extractorFn(data[47]) - extractorFn(data[24]);
    const change = (today - yesterday) / yesterday;
    return {
        yesterday,
        today,
        change,
    };
};

export const calculateLiquidityUtilisation = (data: BalancerData[], chunkSize = 24) => {
    const liquidityExtractor = dataExtractors['totalLiquidity'];
    const swapVolumeExtractor = dataExtractors['totalSwapVolume'];

    const chunkedLiquidity = chunk(data.map(liquidityExtractor), chunkSize);
    const chunkedSwapVolume = chunk(data.map(swapVolumeExtractor), chunkSize);

    const liquidityMeans = chunkedLiquidity.map(mean);
    const volumeMovement = chunkedSwapVolume.map((chunk: number[]) => last(chunk) - first(chunk));

    const utilisations = liquidityMeans.map((meanLiquidity, i) => volumeMovement[i] / meanLiquidity);
    const changes = utilisations.map((ratio, i) => {
        if (i === 0) return NaN;
        return (ratio - utilisations[i - 1]) / utilisations[i - 1];
    });
    return {
        data: utilisations,
        changes,
    };
};

export const calculateRevenueRatio = (data: BalancerData[], chunkSize = 24) => {
    const liquidityExtractor = dataExtractors['totalLiquidity'];
    const swapFeeVolumeExtractor = dataExtractors['totalSwapFeeVolume'];

    const chunkedLiquidity = chunk(data.map(liquidityExtractor), chunkSize);
    const chunkedSwapFeeVolume = chunk(data.map(swapFeeVolumeExtractor), chunkSize);

    const liquidityMeans = chunkedLiquidity.map(mean);
    const volumeMovement = chunkedSwapFeeVolume.map((chunk: number[]) => last(chunk) - first(chunk));

    const revenueRatios = liquidityMeans.map((meanLiquidity, i) => volumeMovement[i] / meanLiquidity);
    const changes = revenueRatios.map((ratio, i) => {
        if (i === 0) return NaN;
        return (ratio - revenueRatios[i - 1]) / revenueRatios[i - 1];
    });

    return {
        data: revenueRatios,
        changes,
    };
};

export function useOnClickOutside(ref: React.Ref<any>, handler: (event: Event) => void) {
    useEffect(
        () => {
            const listener = (event: Event) => {
                // Do nothing if clicking ref's element or descendent elements
                if (!(ref as any)?.current || (ref as any)?.current.contains(event.target)) {
                    return;
                }

                handler(event);
            };

            document.addEventListener('mousedown', listener);
            document.addEventListener('touchstart', listener);

            return () => {
                document.removeEventListener('mousedown', listener);
                document.removeEventListener('touchstart', listener);
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
