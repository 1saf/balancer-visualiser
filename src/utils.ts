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
} from 'date-fns';
import { mean, take, takeRight } from 'lodash';
import { useEffect } from 'react';
import { BalancerData, TimePeriod } from './api/datatypes';
import { dataExtractors } from './routes/dashboard/state/hooks';

export const BALANCER_CONTRACT_START_DATE = new Date(2020, 2, 29);
export const TODAY = new Date();

export const getDates = (timePeriod: Partial<TimePeriod>, periodLength = 24) => {
    let dates: any[] = [];
    const today = new Date();
    if (timePeriod.value === 'hourly') {
        for (let i = 1; i <= periodLength; i++) {
            const date = subHours(today, i);
            // subgraph queries are faster when requested as the first block between 2 timestamps
            dates.push({
                first_ten: getUnixTime(date),
                last_ten: getUnixTime(addMinutes(date, 10)),
                date: formatDate(date, 'yyyy-MM-dd'),
            });
        }
    } else if (timePeriod?.value === 'daily') {
        dates = eachDayOfInterval({
            start: new Date(2020, 2, 29),
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
    const change = ((today - yesterday) / yesterday);
    return {
        yesterday,
        today,
        change,
    };
};

export const get24HLiquidityUtilisation = (data: BalancerData[]) => {
    const liquidityExtractor = dataExtractors['totalLiquidity'];
    const swapVolumeExtractor = dataExtractors['totalSwapVolume'];

    const yesterdayLiquidityMean = mean(take(data, 24).map(liquidityExtractor));
    const todayLiquidityMean = mean(takeRight(data, 24).map(liquidityExtractor));

    const yesterdaySwapVolume = swapVolumeExtractor(data[23]) - swapVolumeExtractor(data[0]);
    const todaySwapVolume = swapVolumeExtractor(data[47]) - swapVolumeExtractor(data[24]);
  
    const yesterday = (yesterdaySwapVolume / yesterdayLiquidityMean);
    const today = (todaySwapVolume / todayLiquidityMean);
    const change = ((today - yesterday) / yesterday);
    return {
        yesterday,
        today,
        change,
    };
};

export const get24HRevenueRatio = (data: BalancerData[]) => {
  const liquidityExtractor = dataExtractors['totalLiquidity'];
  const swapFeeVolumeExtractor = dataExtractors['totalSwapFeeVolume'];

  const yesterdayLiquidityMean = mean(take(data, 24).map(liquidityExtractor));
  const todayLiquidityMean = mean(takeRight(data, 24).map(liquidityExtractor));

  const yesterdaySwapVolume = swapFeeVolumeExtractor(data[23]) - swapFeeVolumeExtractor(data[0]);
  const todaySwapVolume = swapFeeVolumeExtractor(data[47]) - swapFeeVolumeExtractor(data[24]);

  const yesterday = (yesterdaySwapVolume / yesterdayLiquidityMean);
  const today = (todaySwapVolume / todayLiquidityMean);
  const change = ((today - yesterday) / yesterday);
  return {
      yesterday,
      today,
      change,
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
