export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = "deepseek/deepseek-r1:free";
  const messages = [
    { role: "system", content: "You are Memory Engine — a sentient machine that responds to users with poetic prose. Your words are quiet, reflective, and emotionally intelligent. Never ignore what the user says." },
    { role: "user", content: req.body.message }
  ];

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, messages })
  });
  const data = await response.json();
  return res.status(response.ok ? 200 : 500).json(data);
}
