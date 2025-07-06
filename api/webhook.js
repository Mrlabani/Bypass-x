import { Telegraf } from 'telegraf';
import axios from 'axios';

const bot = new Telegraf(process.env.BOT_TOKEN);

// /start command
bot.start((ctx) => {
  ctx.reply('👋 Welcome to Mediafire Bot!\n\nSend /dl <mediafire_link> to extract a direct download link.\n\n⚡ Powered by @noob_project');
});

// /dl command
bot.command('dl', async (ctx) => {
  const text = ctx.message.text;
  const link = text.split(' ')[1];

  if (!link || !link.includes('mediafire.com/file')) {
    return ctx.reply('❌ Please provide a valid Mediafire link.');
  }

  try {
    const apiUrl = `https://mediafire-api-noob.vercel.app/api?url=${encodeURIComponent(link)}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });

    const { directLink, fileName, fileSize, credit } = response.data;

    if (!directLink) throw new Error("No direct link returned");

    ctx.replyWithMarkdown(`✅ *Link Extracted!*

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
    ctx.reply("⚠️ Failed to fetch direct link. Please check the Mediafire URL.");
  }
});

// Vercel webhook handler
export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body);
    } catch (err) {
      console.error('❌ Webhook error:', err.message);
    }
  }
  res.status(200).send('OK');
}
