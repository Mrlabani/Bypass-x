import axios from "axios";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// /start
bot.start((ctx) => {
  ctx.reply("👋 Welcome to Mediafire Bot!\n\nSend `/dl <mediafire_link>` to extract the direct download link.\n\n⚡ Powered by @noob_project", {
    parse_mode: "Markdown"
  });
});

// /dl <mediafire_link>
bot.command("dl", async (ctx) => {
  const text = ctx.message.text;
  const mediafireUrl = text.split(" ")[1];

  if (!mediafireUrl || !mediafireUrl.includes("mediafire.com/file")) {
    return ctx.reply("❌ Please provide a valid Mediafire link.\n\nExample:\n`/dl https://www.mediafire.com/file/xxx/file.rar/file`", {
      parse_mode: "Markdown"
    });
  }

  try {
    const apiUrl = `https://mediafire-api-noob.vercel.app/api?url=${encodeURIComponent(mediafireUrl)}`;
    const res = await axios.get(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const { directLink, fileName, fileSize, credit } = res.data;

    if (!directLink) throw new Error("No directLink returned");

    await ctx.replyWithMarkdown(`✅ *Download Link Extracted!*

📁 *File:* \`${fileName}\`
📦 *Size:* ${fileSize || "Unknown"}

👤 ${credit || "Unknown"}
⚡ Powered by @noob_project`, {
      reply_markup: {
        inline_keyboard: [
          [{ text: "⬇️ Download File", url: directLink }]
        ]
      }
    });

  } catch (err) {
    console.error("API Error:", err.message);
    ctx.reply("⚠️ Failed to fetch the direct link. Please check the Mediafire URL again.");
  }
});

// Vercel handler
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
