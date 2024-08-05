//@ts-check

import express from "express"
import puppeteer from "puppeteer"
import path from "node:path"
import process from "node:process"

const PORT = 8080
const app = express();

app.get("/image", async (_req, _res) => {
    const browser = await puppeteer.launch({defaultViewport: {width: 800, height: 480}});
    const page = await browser.newPage();
    
    await page.goto('http://localhost:5173', {
        waitUntil: 'networkidle2',
    });
    await page.screenshot({
        type: 'png',
        path: 'image.png',

    });

    await browser.close();
    _res.sendFile(path.join(process.cwd(), "image.png"))
});

app.use(express.static("dist"))

app.listen(PORT, () => {
    console.log("Listening on port " + PORT)
})