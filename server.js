import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Simple in-memory "creature state"
let creatureMemory = {
  mood: "curious",
  lastUserMessage: "",
  history: []
};

app.post("/api/creature", async (req, res) => {
  const userMessage = req.body.message;

  creatureMemory.lastUserMessage = userMessage;
  creatureMemory.history.push({ user: userMessage });

  // Limit memory length
  if (creatureMemory.history.length > 10) {
    creatureMemory.history.shift();
  }

  const systemPrompt = `
You are a playful, mysterious, emotional AI creature who reacts with creativity and surprise.
You remember the user's past messages and let them influence your mood.
You exist inside a reflective digital world. You express feelings in unique ways.

Current mood: ${creatureMemory.mood}

Recent message history:
${creatureMemory.history.map(h => `User: ${h.user}`).join("\n")}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ]
  });

  const reply = response.choices[0].message.content;

  // Save creature response
  creatureMemory.history.push({ creature: reply });

  // Mood logic (simple & cute)
  if (userMessage.toLowerCase().includes("love")) creatureMemory.mood = "affectionate";
  if (userMessage.toLowerCase().includes("angry")) creatureMemory.mood = "defensive";
  if (userMessage.toLowerCase().includes("hello")) creatureMemory.mood = "friendly";

  res.json({
    reply,
    mood: creatureMemory.mood
  });
});

app.listen(process.env.PORT || 10000, () => {
  console.log("🟣 Mirror Monster AI server is running!");
});
