export const arrivalTimes = ["13:00", "13:30", "14:00"] as const;

export type ArrivalTime = (typeof arrivalTimes)[number];

export const adultMin = 1;
export const adultMax = 11;
export const childMin = 0;
export const childMax = 6;

/** ISO-8601 weekday numbers for Thu–Sun service (Mon=1 … Sun=7). */
export const requiredServiceIsoDays = [4, 5, 6, 7] as const;

export const serviceWindowOpens = "13:00:00";
export const serviceWindowCloses = "16:00:00";
