import { Telegraf } from "telegraf";
import axios from "axios";
import cheerio from "cheerio";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Mediafire direct link scraper
async function getMediafireLink(url) {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    const $ = cheerio.load(res.data);
    const downloadBtn = $("#downloadButton");

    const directLink = downloadBtn.attr("href");
    const fileName = downloadBtn.text().trim();
    const fileSize = $(".dl-info .dl-info-size").text().trim();

    return {
      directLink,
      fileName: fileName || "Unknown file",
      fileSize: fileSize || "Unknown size",
    };
  } catch (err) {
    console.error("❌ Scrape error:", err.message);
    return null;
  }
}

// /start
bot.start((ctx) => {
  ctx.reply(
    "👋 Welcome to *Mediafire Bot*\n\nSend `/dl <mediafire_link>` to extract a direct download link.\n\n⚡ Powered by @noob_project",
    { parse_mode: "Markdown" }
  );
});

// /dl command
bot.command("dl", async (ctx) => {
  const text = ctx.message.text;
  const url = text.split(" ")[1];

  if (!url || !url.includes("mediafire.com/file")) {
    return ctx.reply(
      "❌ Please send a valid Mediafire link.\n\nExample:\n`/dl https://www.mediafire.com/file/xyz/file.rar/file`",
      { parse_mode: "Markdown" }
    );
  }

  ctx.reply("🔍 Fetching the direct link...");

  const data = await getMediafireLink(url);

  if (!data || !data.directLink) {
    return ctx.reply("⚠️ Failed to extract direct link. Try a different Mediafire URL.");
  }

  const { directLink, fileName, fileSize } = data;

  ctx.replyWithMarkdown(
    `✅ *Link Extracted!*

📁 *File:* \`${fileName}\`
📦 *Size:* ${fileSize}

⚡ Powered by @noob_project`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬇️ Download File", url: directLink }],
        ],
      },
    }
  );
});

// Webhook handler for Vercel
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await bot.handleUpdate(req.body);
    } catch (err) {
      console.error("Webhook error:", err.message);
    }
  }
  res.status(200).send("OK");
}
