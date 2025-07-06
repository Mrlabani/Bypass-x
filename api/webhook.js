import axios from 'axios';
import { Telegraf } from 'telegraf';

const bot = new Telegraf(process.env.BOT_TOKEN);

// Command: /start
bot.start((ctx) => {
  ctx.reply("👋 Send /dl <mediafire_url> to get the direct download link.\n\n⚡ Powered by @noob_project");
});

// Command: /dl <url>
bot.command("dl", async (ctx) => {
  const text = ctx.message.text;
  const url = text.split(" ")[1];

  if (!url || !url.includes("mediafire.com/file")) {
    return ctx.reply("❌ Please send a valid Mediafire link like:\n`/dl https://www.mediafire.com/file/xxx/file.rar/file`", {
      parse_mode: "Markdown"
    });
  }

  try {
    const apiUrl = `https://mediafire-api-noob.vercel.app/api?url=${encodeURIComponent(url)}`;
    const res = await axios.get(apiUrl);
    const { directLink, fileName, fileSize, credit } = res.data;

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
    console.error(err.message);
    ctx.reply("⚠️ Failed to fetch the direct link. Please check the Mediafire URL again.");
  }
});

// Vercel handler
export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await bot.handleUpdate(req.body);
    } catch (err) {
      console.error("Error handling update:", err);
    }
  }
  res.status(200).send("OK");
}
