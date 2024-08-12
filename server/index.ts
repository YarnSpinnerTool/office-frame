import express from "express"
import puppeteer from "puppeteer"
import path from "node:path"
import process from "node:process"
import fs from "node:fs"

import { config as configureDotEnv } from "dotenv"
import { CalendarResponse, Endpoint } from "../common/schemas";

configureDotEnv();

const PORT = 8080
const app = express();

import morgan from "morgan";
import { fetchData } from "./notion/fetchDataFromNotion"
import { Item, NotionDate } from "./notion"

app.use(morgan("dev"))

const getName = (i: Item): string => {

    if ("name" in i && typeof i.name === "string") {
        return i["name"];
    } else {
        return "(unknown)"
    }
}

app.get("/cache-data", async (_req, res: express.Response<object>) => {
    const entries = await fetchData(process.env.CALENDAR_ID as string);

    fs.writeFileSync(".cache.json", JSON.stringify(entries, null, 2));
    res.send(entries);
});


app.get("/calendar" satisfies Endpoint, async (_req, res: express.Response<CalendarResponse>) => {

    // const entries = JSON.parse(fs.readFileSync(".cache.json").toString()) as Array<Item>
    const entries = await fetchData(process.env.CALENDAR_ID as string);

    const events = entries.map<CalendarResponse["entries"][number]>((i) => {
        return {
            title: getName(i),
            start: (i["date"] as NotionDate).start ?? "unknown",
            end: (i["date"] as NotionDate).end ?? undefined,
        }
    });

    res.send({
        entries: events

    })
})

app.get("/image" satisfies Endpoint, async (_req, _res) => {
    try {

        const browser = await puppeteer.launch({
            defaultViewport: {
                width: 800, height: 480
            },
        });
        const page = await browser.newPage();

        await page.goto('http://localhost:' + PORT, {
            waitUntil: 'networkidle2',
        });
        await page.screenshot({
            type: 'png',
            path: 'image.png',

        });

        await browser.close();
        _res.sendFile(path.join(process.cwd(), "image.png"))
    } catch (err) {
        _res.status(500).send("Internal error");
        throw err;
    }
});

app.use(express.static("dist"))

app.listen(PORT, () => {
    console.log("Listening on port " + PORT)
})