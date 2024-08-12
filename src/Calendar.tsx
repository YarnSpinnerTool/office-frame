import {
    CalendarResponseSchema,
    type CalendarResponse,
    type Endpoint,
} from "../common/schemas";
import { useQuery } from "@tanstack/react-query";

import { FormatRelativeToken, isAfter, isBefore, Locale } from "date-fns";

const apiHost = "http://localhost:8080";
const endPoint = (path: Endpoint): URL => {
    const url = new URL(apiHost);
    url.pathname = path;
    return url;
};

import { enAU } from "date-fns/locale";
import {
    formatDistanceToNow,
    formatRelative as formatRelativeBase,
} from "date-fns";

// https://date-fns.org/docs/I18n-Contribution-Guide#formatrelative
// https://github.com/date-fns/date-fns/blob/master/src/locale/en-US/_lib/formatRelative/index.js
// https://github.com/date-fns/date-fns/issues/1218
// https://stackoverflow.com/questions/47244216/how-to-customize-date-fnss-formatrelative
const formatRelativeLocaleWithoutTime: Record<FormatRelativeToken, string> = {
    lastWeek: "'Last' eeee",
    yesterday: "'Yesterday'",
    today: "'Today'",
    tomorrow: "'Tomorrow'",
    nextWeek: "'Next' eeee",
    other: "d MMMM",
};

const formatRelativeLocaleWithTime: Record<FormatRelativeToken, string> = {
    lastWeek: "'Last' eeee 'at' h:mm a",
    yesterday: "'Yesterday' 'at' h:mm a",
    today: "'Today' 'at' h:mm a",
    tomorrow: "'Tomorrow' 'at' h:mm a",
    nextWeek: "'Next' eeee 'at' h:mm a",
    other: "d MMMM 'at' h:mm a",
};

const localeWithoutTime: Locale = {
    ...enAU,
    formatRelative: (token) => formatRelativeLocaleWithoutTime[token],
};

const localeWithTime: Locale = {
    ...enAU,
    formatRelative: (token) => formatRelativeLocaleWithTime[token],
};

const formatRelativeWithoutTime = (date: Date) =>
    formatRelativeBase(date, new Date(), { locale: localeWithoutTime });
const formatRelativeWithTime = (date: Date) =>
    formatRelativeBase(date, new Date(), { locale: localeWithTime });

const fetchCalendarEntries = async (): Promise<CalendarResponse> => {
    console.log("I'm loadin' here");
    const result = await fetch(endPoint("/calendar"));

    const response = await CalendarResponseSchema.safeParseAsync(
        await result.json(),
    );

    if (!response.success) {
        throw new Error(
            "Failed to get calendar data: " + JSON.stringify(response.error),
        );
    }

    return response.data;
};

export function CalendarView(props: { after: Date; count: number }) {
    // Access the client
    // const queryClient = useQueryClient()

    // Queries
    const query = useQuery({
        queryKey: ["events"],
        queryFn: fetchCalendarEntries,
    });

    if (query.isFetching) {
        return <div className="network-loading">Loading calendar...</div>;
    }

    if (query.isError || query.data === undefined) {
        return <>Error loading calendar!</>;
    }

    const events = query.data.entries
        .map((e) => {
            return {
                title: e.title,
                start: new Date(e.start),
                end: e.end ? new Date(e.end) : undefined,
                describe: (): string => {
                    const hasTime = e.start.includes("T");

                    const describeDate = (d: Date): string => {
                        if (hasTime) {
                            return formatRelativeWithTime(d);
                        } else {
                            return formatRelativeWithoutTime(d);
                        }
                    };
                    const start = new Date(e.start);
                    const end =
                        e.end !== undefined ? new Date(e.end) : undefined;

                    if (end) {
                        if (isAfter(start, Date.now())) {
                            return `In ${formatDistanceToNow(start)} (${describeDate(start)})`;
                        } else {
                            return `Until ${formatDistanceToNow(end)} from now (${describeDate(end)})`;
                        }
                    } else {
                        return `In ${formatDistanceToNow(start)} (${describeDate(start)})`;
                    }
                },
            };
        })
        .filter((e) => {
            return (
                isAfter(e.start, props.after) ||
                (e.end && isAfter(e.end, props.after))
            );
        });

    events
        .sort((a, b) => {
            if (
                isBefore(a.start, Date.now()) &&
                isBefore(b.start, Date.now()) &&
                a.end &&
                b.end &&
                isAfter(a.end, Date.now()) &&
                isAfter(b.end, Date.now())
            ) {
                // If both events started in the past and both have an end date in the future, sort by end date
                return isBefore(a.end, b.end) ? -1 : 1;
            } else {
                // Otherwise, sort by start date
                return isBefore(a.start, b.start) ? -1 : 1;
            }
        })
        .slice(props.count);

    return (
        <div>
            {events.map((e, i) => (
                <div key={i} style={{ paddingBottom: "8px" }}>
                    <div style={{ fontWeight: "bold" }}>{e.title}</div>
                    <div style={{ paddingLeft: "16px" }}>{e.describe()}</div>
                </div>
            ))}
        </div>
    );
}
