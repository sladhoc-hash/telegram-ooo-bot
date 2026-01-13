import express from "express";
import fetch from "node-fetch";
import fs from "fs";

const app = express();
app.use(express.json());

const TOKEN = "8559693091:AAFduFR38wbrIUDJO6cfOrPC9m4vL5TP69A";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const STATE_FILE = "./state.json";

// 📦 Leer estado
function loadState() {
  try {
    const data = fs.readFileSync(STATE_FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {
      botOn: false,
      autoMessage: "Estoy fuera de la oficina"
    };
  }
}

// 💾 Guardar estado
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// Estado inicial
let state = loadState();

// 📤 Enviar mensaje
async function sendMessage(chatId, text) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}

// 📥 Webhook
app.post("/telegram", async (req, res) => {
  const msg = req.body.message;
  if (!msg) return res.sendStatus(200);

  const chatId = msg.chat.id;
  const text = msg.text || "";

  console.log("Mensaje:", text);

  // /start
  if (text === "/start") {
    await sendMessage(
      chatId,
      "🤖 Bot Out of Office\n\n" +
      "/on MENSAJE → activar\n" +
      "/off → desactivar\n" +
      "/status → estado"
    );
  }

  // /on
  else if (text.startsWith("/on")) {
    state.botOn = true;
    state.autoMessage =
      text.replace("/on", "").trim() || state.autoMessage;
    saveState(state);

    await sendMessage(chatId, "✅ Activado\nMensaje:\n" + state.autoMessage);
  }

  // /off
  else if (text === "/off") {
    state.botOn = false;
    saveState(state);
    await sendMessage(chatId, "❌ Bot desactivado");
  }

  // /status
  else if (text === "/status") {
    await sendMessage(
      chatId,
      state.botOn
        ? `🟢 ACTIVO\nMensaje:\n${state.autoMessage}`
        : "🔴 INACTIVO"
    );
  }

  // Mensaje normal
  else if (state.botOn) {
    await sendMessage(chatId, state.autoMessage);
  }

  res.sendStatus(200);
});

// 🚀 Start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot activo en puerto", PORT);
});
