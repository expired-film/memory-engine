export default async function handler(req, res) {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = "deepseek/deepseek-r1:free";
  const messages = req.body.messages;

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
