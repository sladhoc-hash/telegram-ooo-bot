const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// 🔑 TU TOKEN (ya incluido)
const TOKEN = "8559693091:AAFduFR38wbrIUDJO6cfOrPC9m4vL5TP69A";
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;

// Mensaje automático
const AUTO_REPLY = "🚫 Estoy fuera de la oficina. Te responderé cuando vuelva.";

app.post("/telegram", async (req, res) => {
  try {
    const message = req.body.message;

    if (!message || !message.chat) {
      return res.sendStatus(200);
    }

    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: message.chat.id,
        text: AUTO_REPLY
      })
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error);
    res.sendStatus(500);
  }
});

// Puerto requerido por Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Bot activo en puerto", PORT);
});
