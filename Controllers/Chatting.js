import chatmodel from "../Core/CoreModels.js"; 

export async function ChatCompletion(req, res) {

  const messages = req.body.messages;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {
    const response = await chatmodel.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: messages
    });

    const reply = response.choices[0].message.content;

    res.json({
      reply,
      usage: response.usage
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create chat completion" });
  }
}