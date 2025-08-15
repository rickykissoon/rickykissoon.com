import { useEffect, useState } from "react";

type Unit =
    | "years"
    | "months"
    | "weeks"
    | "days"
    | "hours"
    | "minutes"
    | "seconds"
    | "milliseconds";

const DEFAULT_UNITS: Unit[] = [
    "years",
    "months",
    "weeks",
    "days",
    "hours",
    "minutes",
    "seconds",
    "milliseconds"
];

const UNIT_DEFS: {
    key: Unit;
    size: number;
    pad: number;
    label: string;
}[] = [
    { key: "years",         size: 365.25 * 24 * 60 * 60 * 1000, pad: 3, label: "y" },
    { key: "months",        size: 30.4375 * 24 * 60 * 60 * 1000, pad: 2, label: "mo" },
    { key: "weeks",         size: 7 * 24 * 60 * 60 * 1000, pad: 2, label: "w" },
    { key: "days",          size: 24 * 60 * 60 * 1000, pad: 3, label: "d" },
    { key: "hours",         size: 60 * 60 * 1000, pad: 2, label: "h" },
    { key: "minutes",       size: 60 * 1000, pad: 2, label: "m" },
    { key: "seconds",       size: 1000, pad: 2, label: "s" },
    { key: "milliseconds",   size: 1, pad: 3, label: "ms" },
];

export function useElapsedTime(start: string, units: Unit[] = DEFAULT_UNITS) {
    const startTime = new Date(start).getTime();
    const [elapsed, setElapsed] = useState(() => Date.now() - startTime);

    useEffect(() => {
        let frame: number;
        const loop = () => {
            setElapsed(Date.now() - startTime);
            frame = requestAnimationFrame(loop);
        };
        frame = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frame);
    }, [startTime]);

    return formatElapsed(elapsed, units);
}

function formatElapsed(ms: number, units: Unit[]) {
    const include = new Set(units);
    let remaining = ms;

    const values = Object.fromEntries(
        UNIT_DEFS.map((u) => [u.key, 0])
    ) as Record<Unit, number>;

    for (const def of UNIT_DEFS) {
        if (!include.has(def.key)) {
            continue;
        }

        const val = def.size === 1 ? Math.floor(remaining) : Math.floor(remaining / def.size);
        values[def.key] = val;
        remaining -= val * def.size;
    }

    const formatted = UNIT_DEFS.filter((d) => include.has(d.key))
        .map((d) => `${String(values[d.key]).padStart(d.pad, "0")}${d.label}`)
        .join("::");

    return {
        ...values,
        formatted,
    };
}

export function useNowSecond(initialNow?: number) {
    const [now, setNow] = useState(initialNow ?? Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    return now;
}


export function formatElapsedSubset(ms: number, units: Unit[]) {
    const defs: Record<Unit, { size: number; pad: number; label: string }> = {
        years: { size: 365.25 * 24 * 3600 * 1000, pad: 3, label: "y" },
        months:{ size: 30.4375 * 24 * 3600 * 1000, pad: 2, label: "m" },
        weeks: { size: 7 * 24 * 3600 * 1000, pad: 2, label: "w" },
        days:  { size: 24 * 3600 * 1000, pad: 3, label: "d" },
        hours: { size: 3600 * 1000, pad: 2, label: "h" },
        minutes:{ size: 60 * 1000, pad: 2, label: "m" },
        seconds:{ size: 1000, pad: 2, label: "s" },
        milliseconds:{ size: 1, pad: 3, label: "ms" },
    };
  
    let remaining = ms;
    const parts = units.map(u => {
        const { size, pad, label } = defs[u];
        const val = u === "milliseconds" ? Math.floor(remaining) : Math.floor(remaining / size);
      
        remaining -= val * size;
      
        return `${String(val).padStart(pad, "0")}${label}`;
    });
  
    return parts.join("::");
}