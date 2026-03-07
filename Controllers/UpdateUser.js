import ValuesAnalyzer from "../Core/ValuesAnalyzer";
import User from "../Database/Schemas";

export async function UpdateScoringVals(req, res) {
    const {messages, userId} = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid messages format" });
    }
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        
        const analyzer = new ValuesAnalyzer();
        const values = await analyzer.analyzeValues(messages);
        const { riasec, sifa } = splitResult(values);
        const response = await analyzer.StoreValues(userId, riasec, sifa);
        res.json({ message: "Values analyzed and stored successfully", response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to analyze and store values" });
    }
}

export async function AddMessageHistory(req, res) {
  const { messages, name } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "Invalid messages format" });
  }

  if (!name) {
    return res.status(400).json({ error: "User name is required" });
  }

  try {
    const response = await User.findOneAndUpdate(
      { name: name },
      { $push: { chatHistory: { $each: messages } } },
      { new: true }
    );

    res.json({
      message: "Message history stored successfully",
      response
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to store message history" });
  }
}