
import { subDays, subMonths, subYears, subHours, eachDayOfInterval, getUnixTime, addMinutes, format as formatDate, startOfDay } from 'date-fns';
import { TimePeriod } from './api/datatypes';

export const getDates = (timePeriod: TimePeriod) => {
    let dates: any[] = [];
    const today = new Date();
    if (timePeriod.value === 'hourly') {
        for (let i = 1; i <= 24; i++) {
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

    return dates.reverse();
};