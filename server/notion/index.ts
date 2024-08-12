import { Client } from "@notionhq/client";
import { DatePropertyItemObjectResponse } from "@notionhq/client/build/src/api-endpoints";

import { config } from "dotenv"

config();


export const notion = new Client({
    auth: process.env.NOTION_TOKEN,
});

export function camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
        return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
}

export type NotionDate = NonNullable<DatePropertyItemObjectResponse["date"]>

export type PropertyValue = string | number | NotionDate | {
    unknownType: unknown
}

export type Item = Record<string, PropertyValue> & { id: string; url: string; };