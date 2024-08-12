import { PropertyItemObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion } from "./index";
import { NotionDate } from "./index";

/**
 * If property is paginated, returns an array of property items.
 *
 * Otherwise, it will return a single property item.
 */
export async function getPropertyValue({
    pageId, propertyId,
}: {
    pageId: string;
    propertyId: string;
}): Promise<PropertyItemObjectResponse | Array<PropertyItemObjectResponse>> {
    let propertyItem = await notion.pages.properties.retrieve({
        page_id: pageId,
        property_id: propertyId,
    });
    if (propertyItem.object === "property_item") {
        return propertyItem;
    }

    // Property is paginated.
    let nextCursor = propertyItem.next_cursor;
    const results = propertyItem.results;

    while (nextCursor !== null) {
        propertyItem = await notion.pages.properties.retrieve({
            page_id: pageId,
            property_id: propertyId,
            start_cursor: nextCursor,
        });

        if (propertyItem.object === "list") {
            nextCursor = propertyItem.next_cursor;
            results.push(...propertyItem.results);
        } else {
            nextCursor = null;
        }
    }

    return results;
}
/**
* Extract status as string from property value
*/
export function getStatusPropertyValue(
    property: PropertyItemObjectResponse | Array<PropertyItemObjectResponse>): string {

    const prop = Array.isArray(property) ? (property[0] || undefined) : property;
    if (prop === undefined) {
        return "";
    }

    if (prop.type === "select") {
        return prop.select?.name ?? "No Status";
    } else {
        return "No Status";
    }
}
/**
 * Extract title as string from property value
 */
export function getTitlePropertyValue(
    property: PropertyItemObjectResponse | Array<PropertyItemObjectResponse>): string {
    const prop = Array.isArray(property) ? (property[0] || undefined) : property;
    if (prop === undefined) {
        return "";
    }

    if (prop.type === "title") {
        return prop.title.plain_text;
    } else {
        return "";
    }
}
/**
 * Extract text from property value
 */
export function getTextPropertyValue(
    property: PropertyItemObjectResponse | Array<PropertyItemObjectResponse>
): string {

    const prop = Array.isArray(property) ? (property[0] || undefined) : property;
    if (prop === undefined) {
        return "";
    }

    if (prop.type === "rich_text") {
        return prop.rich_text.plain_text;
    } else {
        return "";
    }
}

export function getDatePropertyValue(
    property: PropertyItemObjectResponse | Array<PropertyItemObjectResponse>
): NotionDate {

    const prop = Array.isArray(property) ? (property[0] || undefined) : property;
    if (prop === undefined) {
        throw new Error("Property is undefined")
    }

    if (prop.type !== "date") {
        throw new Error("Property is not a date")
    } else if (prop.date === null) {
        throw new Error("Property's date is null")
    } else {
        return prop.date;
    }
}

/** Extract first file URL from property value */
export function getFilesPropertyValue(
    property: PropertyItemObjectResponse | Array<PropertyItemObjectResponse>
): string {
    const prop = Array.isArray(property) ? property[0] : property;

    if (prop.type === "files" && prop.files.length > 0) {
        const file = prop.files[0];
        if (file.type === "file") {
            return file.file.url
        } else if (file.type === "external") {
            return file.external.url;
        } else {
            return "";
        }
    } else {
        return "";
    }
}