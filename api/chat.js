export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = "deepseek/deepseek-r1:free";
  const messages = req.body.messages;

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

    if (!response.ok) {
      console.error("API error:", data);
      return res.status(500).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
