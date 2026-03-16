const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, {polling: true});
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const LINK_CANVA = "https://www.canva.com/brand/join?token=V5kr_b67nKspzM5ZBcI1zQ&brandingVariant=edu&referrer=team-invite"; 

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  if (msg.photo) {
    bot.sendMessage(chatId, "🔍 Analizando tu captura... un momento.");
    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const fileUrl = await bot.getFileLink(fileId);
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');

      const prompt = "Analiza esta imagen. ¿Es una captura de YouTube que muestra que el usuario está 'Suscrito' a canales como Alabanza 7x7, Gozo y Fe, Guardian RC o Vivo RC? Responde 'TODO_OK' si es positivo, de lo contrario explica qué falta.";

      const result = await model.generateContent([prompt, { inlineData: { data: base64Data, mimeType: "image/jpeg" } }]);
      const text = result.response.text();

      if (text.includes("TODO_OK")) {
        bot.sendMessage(chatId, `✅ ¡Confirmado! Aquí tienes tu link: ${LINK_CANVA}`);
      } else {
        bot.sendMessage(chatId, "❌ No detecto la suscripción. Asegúrate de que se vea el botón 'Suscrito'.");
      }
    } catch (e) { bot.sendMessage(chatId, "⚠️ Error. Intenta de nuevo."); }
  }
});
