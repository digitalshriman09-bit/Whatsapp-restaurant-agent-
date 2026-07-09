const express = require("express");
require("dotenv").config();
const restaurant = require("./restaurant-config");

const app = express();
app.use(express.json());

const {
  VERIFY_TOKEN,
  WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID,
  ANTHROPIC_API_KEY,
  PORT = 3000
} = process.env;

const conversations = new Map();
const MAX_TURNS_KEPT = 12;

function getHistory(waId) {
  if (!conversations.has(waId)) conversations.set(waId, []);
  return conversations.get(waId);
}

app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified.");
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

app.post("/webhook", async (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) return;

    const from = message.from;
    const text = message.text?.body;

    if (!text) {
      await sendWhatsAppMessage(
        from,
        `Thanks for your message! I can currently only read text — could you type your question? For anything urgent, call us at ${restaurant.phone}.`
      );
      return;
    }

    const history = getHistory(from);
    history.push({ role: "user", content: text });
    if (history.length > MAX_TURNS_KEPT) history.splice(0, history.length - MAX_TURNS_KEPT);

    const reply = await askClaude(history);

    history.push({ role: "assistant", content: reply });

    await sendWhatsAppMessage(from, reply);
  } catch (err) {
    console.error("Error handling incoming message:", err);
  }
});

async function askClaude(history) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 500,
      system: restaurant.buildSystemPrompt(),
      messages: history
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("Claude API error:", response.status, errText);
    return `Sorry, I'm having trouble right now. Please call us at ${restaurant.phone} and we'll help right away.`;
  }

  const data = await response.json();
  const textBlocks = (data.content || []).filter(b => b.type === "text").map(b => b.text);
  return textBlocks.join("\n").trim() || `Sorry, could you rephrase that? Or call us at ${restaurant.phone}.`;
}

async function sendWhatsAppMessage(to, body) {
  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${WHATSAPP_TOKEN}`
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body }
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error("WhatsApp send error:", response.status, errText);
  }
}

app.get("/", (req, res) => res.send("WhatsApp restaurant AI agent is running."));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
