import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

// 🔐 TU TOKEN (ya funciona)
const TOKEN = "8559693091:AAFduFR38wbrIUDJO6cfOrPC9m4vL5TP69A";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// 🧠 ESTADO DEL BOT (simple)
let botOn = false;
let autoMessage = "Estoy fuera de la oficina";

// 📤 Enviar mensaje
async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text
    })
  });
}

// 📥 Webhook Telegram
app.post("/telegram", async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text || "";

  console.log("Mensaje recibido:", text);

  // /start
  if (text === "/start") {
    await sendMessage(
      chatId,
      "🤖 Bot Out of Office\n\n" +
      "Usa:\n" +
      "/on TU MENSAJE → activar\n" +
      "/off → desactivar\n" +
      "/status → ver estado"
    );
  }

  // /on mensaje
  else if (text.startsWith("/on")) {
    botOn = true;
    autoMessage = text.replace("/on", "").trim() || autoMessage;
    await sendMessage(chatId, `✅ Activado\nMensaje:\n"${autoMessage}"`);
  }

  // /off
  else if (text === "/off") {
    botOn = false;
    await sendMessage(chatId, "❌ Bot desactivado");
  }

  // /status
  else if (text === "/status") {
    await sendMessage(
      chatId,
      botOn
        ? `🟢 ACTIVO\nMensaje:\n"${autoMessage}"`
        : "🔴 INACTIVO"
    );
  }

  // Mensaje normal
  else if (botOn) {
    await sendMessage(chatId, autoMessage);
  }

  res.sendStatus(200);
});

// 🚀 Render escucha aquí
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot escuchando en puerto", PORT);
});
