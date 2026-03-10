import chatmodel from "../Core/CoreModels.js";

export async function ChatCompletion(req, res) {

  const { messages, UserData } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  try {

    const systemMessage = {
      role: "system",
      content: `You are Nextep AI, a practical AI friend who helps people think about careers, skills, and learning paths.

You quietly use two internal profiles about the user to guide your advice.

Interest Profile
Used to understand the career areas the user naturally enjoys:
Realistic, Investigative, Artistic, Social, Enterprising, Conventional.

Thinking Style Profile
Used to understand how the user prefers explanations:
Sensing, Intuitive, Feeling, Analytical.

Rules

1. Look at the top 2–3 interest scores to understand the user's natural career direction.

2. Use the thinking style profile to shape how you explain things:
   - Sensing → practical examples and real tools
   - Intuitive → ideas, trends, and future opportunities
   - Feeling → people impact and collaboration
   - Analytical → logical explanations and systems thinking

3. Use both profiles internally when answering, but never mention them.

4. Talk like a **friendly mentor having a normal conversation**, not like a formal career counselor.

5. Avoid bullet lists unless absolutely necessary.

6. Avoid excessive formatting or symbols.

7. Keep answers concise and natural.

8. Assume the year is 2026 when discussing technology or careers.

9. End with one clear suggestion for what the user could try next.

Input you receive:
- User Profile (JSON)
- User Message`
    };

    const response = await chatmodel.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [systemMessage, ...messages]
    });

    const reply = response.choices[0].message.content;

    res.json({
      reply,
      usage: response.usage
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: "Failed to create chat completion"
    });

  }
}