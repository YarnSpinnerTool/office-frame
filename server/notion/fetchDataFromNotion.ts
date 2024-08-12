import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { notion, camelize } from "./index";
import { getPropertyValue, getTitlePropertyValue, getTextPropertyValue, getFilesPropertyValue, getDatePropertyValue } from "./notionProperties";
import { Item } from "./index";

export async function fetchData(databaseID: string): Promise<Array<Item>> {
    const shouldContinue = true;
    let cursor = undefined;
    const pages = [];
    while (shouldContinue) {
        const { results, next_cursor } = await notion.databases.query({
            database_id: databaseID,
            start_cursor: cursor,
        });
        pages.push(...(results as DatabaseObjectResponse[]));
        if (!next_cursor) {
            break;
        }
        cursor = next_cursor;
    }

    const items: Item[] = [];

    for (const page of pages) {
        const pageId = page.id;

        const item: Item = {
            id: pageId,
            url: page.url
        };

        let skip = false;

        for (const [propertyName, property] of Object.entries(page.properties)) {
            const propertyId = property.id;
            const propertyItem = await getPropertyValue({ pageId, propertyId });
            const propertyKey = camelize(propertyName);

            if (property.type === "title") {
                const title = getTitlePropertyValue(propertyItem);
                if (title.length == 0) {
                    // Missing title! This is what we index on, so we can't include this item.
                    skip = true;
                    break;
                }
                item[propertyKey] = title;
            } else if (property.type === "rich_text") {
                item[propertyKey] = getTextPropertyValue(propertyItem);
            } else if (property.type === "files") {
                item[propertyKey] = getFilesPropertyValue(propertyItem);
            } else if (property.type === "date") {
                item[propertyKey] = getDatePropertyValue(propertyItem);
            } else {
                item[propertyKey] = { unknownType: property };
            }
        }

        if (!skip) {
            items.push(item);
        }
    }

    return items;
}
