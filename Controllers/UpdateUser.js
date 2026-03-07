import Analyzer from "../Core/Analyzer.js";
import User from "../Database/Schemas.js";

export async function UpdateScoringVals(req, res) {
    const {messages, name, prevRIASECval, prevSAFIAVAl, PrevSKills} = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid messages format" });
    }
    if (!name) {
        return res.status(400).json({ error: "User name is required" });
    }
    try {
        
        const analyzer = new Analyzer();
        const values = await analyzer.analyzeSkillValues(messages);
        console.log(values.riasec, values.sifa, values.skills);
        const response = await analyzer.StoreSkillValues({ name, RIASECval: values.riasec, SAFIAVAL: values.sifa, prevRIASECval, prevSAFIAVAl, prevSkills: PrevSKills, Skills: values.skills });
        res.json({ message: "Values analyzed and stored successfully", response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to analyze and store values" });
    }
}

export async function AddMessageHistory(req, res) {
  const { messages, name} = req.body;

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