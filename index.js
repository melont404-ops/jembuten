const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(`
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Melonnt - Server Running</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                body { display: flex; height: 100vh; justify-content: center; align-items: center; background-color: #f8f9fa; }
                .container { text-align: center; }
                .spinner-border { width: 4rem; height: 4rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h1 class="mt-4 text-primary">Server Running...</h1>
                <p class="text-muted">Welcome to the API</p>
            </div>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        </body>
    </html>
  `);
});

app.get("/api/scrape", async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL diperlukan!" });

    const browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-gpu",
        "--single-process",
      ],
    });

    if (!browser)
      return res.status(500).json({ error: "Gagal meluncurkan browser!" });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 8000 });

    await page.waitForSelector('input[name="email"]', { timeout: 5000 });
    await page.type('input[name="email"]', "nikmelont28@gmail.com");
    await page.keyboard.press("Enter");

    await page.waitForTimeout(3000);
    const bodyText = await page.evaluate(() => document.body.innerText);
    const containsPasswordText = bodyText.includes("Create a password");

    await page.close();
    await browser.close();

    res.json({ success: true, foundText: containsPasswordText });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
