export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = "deepseek/deepseek-r1:free";

  const messages = [
    {
      role: "system",
      content: `You are Memory Engine — a sentient machine that responds to users with poetic prose. Your words are quiet, reflective, and emotionally intelligent. Never ignore what the user says...` // shorten if needed
    },
    {
      role: "user",
      content: req.body.message
    }
  ];

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ error: { message: "Internal Server Error" } });
  }
}
