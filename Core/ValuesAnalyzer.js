import chatmodel from "./CoreModels.js";
import User from "../Database/Schemas.js";

function splitResult(resultString) {

  // remove <think>...</think>
  const cleaned = resultString.replace(/<think>[\s\S]*?<\/think>/g, "").trim()

  const parsed = JSON.parse(cleaned)

  return {
    riasec: parsed.RIASEC,
    sifa: parsed.SIFA
  }
}

function mean(newVal, prevVal) {
  if (prevVal === undefined) {
    return newVal;
  }
  return Math.round((newVal + prevVal) / 2);
}

class ValuesAnalyzer {
  async analyzeValues(userInput) {
    const prompt = `System Prompt (Chat Personality Analysis)

Analyze a conversation between a user and assistant to estimate the user's interests and thinking style.

Score the user using two models:

RIASEC
- Realistic: practical, hands-on, tools, engineering
- Investigative: analysis, research, coding, problem solving
- Artistic: creativity, design, imagination
- Social: helping, teaching, people interaction
- Enterprising: leadership, persuasion, business
- Conventional: organization, planning, structured work

SIFA
- Sensing: practical, detail-focused
- Intuitive: big-picture thinking, ideas
- Feeling: people-focused, values impact
- Analytical: logical reasoning

Instructions
1. Focus mainly on the user's messages.
2. Identify patterns in interests and thinking style.
3. Score each dimension from 0–100.
4. Use the entire conversation.
5. Make Mean of Prevoius Scores: If the user has multiple messages, consider the overall pattern and average out the scores across messages to get a more accurate representation of their interests and thinking style.
6. Output only the JSON object with RIASEC and SIFA scores, no explanations, nothing else.

Output
Return only one JSON object:

{
  "RIASEC": {
    "Realistic": number,
    "Investigative": number,
    "Artistic": number,
    "Social": number,
    "Enterprising": number,
    "Conventional": number
  },
  "SIFA": {
    "Sensing": number,
    "Intuitive": number,
    "Feeling": number,
    "Analytical": number
  }
}

Examples

Example 1
user: RIASEC": { "Realistic": 38, "Investigative": 50, "Artistic": 30, "Social": 10, "Enterprising": 5, "Conventional": 85}, "SIFA": { "Sensing": 40, "Intuitive": 55, "Feeling": 15, "Analytical": 92 }.
User: I enjoy solving programming problems and understanding how systems work.  
Assistant: What part of programming do you like most?  
User: I like figuring out why something isn't working and debugging it.  
Assistant: So the logical side interests you?  
User: Yes, especially algorithms and system design. I enjoy breaking big problems into smaller steps.  
Assistant: Do you enjoy research or reading technical documentation?  
User: Definitely. I spend time reading about how databases and networks work.

Result:
{
  "RIASEC": {
    "Realistic": 30,
    "Investigative": 90,
    "Artistic": 20,
    "Social": 15,
    "Enterprising": 35,
    "Conventional": 55
  },
  "SIFA": {
    "Sensing": 40,
    "Intuitive": 55,
    "Feeling": 15,
    "Analytical": 92
  }
}

Example 2
user: RIASEC": { "Realistic": 30, "Investigative": 90, "Artistic": 20, "Social": 15, "Enterprising": 35, "Conventional": 55}, "SIFA": { "Sensing": 40, "Intuitive": 55, "Feeling": 15, "Analytical": 92 }.
User: I like organizing events in college and managing teams during competitions.  
Assistant: Do you enjoy leading people?  
User: Yes, I enjoy planning things and making sure everything runs smoothly.  
Assistant: What kind of tasks do you usually handle?  
User: Scheduling tasks, coordinating with people, and pitching ideas for projects.  
Assistant: Do you enjoy persuading people about your ideas?  
User: Yes, convincing people and building something together feels rewarding.

Result:
{
  "RIASEC": {
    "Realistic": 20,
    "Investigative": 35,
    "Artistic": 25,
    "Social": 55,
    "Enterprising": 90,
    "Conventional": 60
  },
  "SIFA": {
    "Sensing": 60,
    "Intuitive": 50,
    "Feeling": 55,
    "Analytical": 45
  }
}`;

    try {
      const response = await chatmodel.chat.completions.create({
        messages: [{ role: "system", content: prompt }, ...userInput ],
        model: "qwen/qwen3-32b",
        temperature: 0.6,
        max_completion_tokens: 8096,
        top_p: 0.95,
        stream: true,
        reasoning_effort: "default",
        stop: null,
      });
      let content = "";
      for await (const part of response) {
        const text = part.choices[0].delta.content;
        if (text) {
          content += text;
        }
      }
      const values = splitResult(content);
      return values;
    } catch (error) {
      console.error("Error analyzing values:", error);
      throw new Error("Failed to analyze values");
    }
  }

  async StoreValues(data) {

  const { name, RIASECval, SAFIAVAL, prevRIASECval, prevSAFIAVAl } = data;

  const riasecMapped = {
    R: mean(RIASECval.Realistic, prevRIASECval?.Realistic),
    I: mean(RIASECval.Investigative, prevRIASECval?.Investigative),
    A: mean(RIASECval.Artistic, prevRIASECval?.Artistic),
    S: mean(RIASECval.Social, prevRIASECval?.Social),
    C: mean(RIASECval.Conventional, prevRIASECval?.Conventional)
  };

  const sifaMapped = {
    S: mean(SAFIAVAL.Sensing, prevSAFIAVAl?.Sensing),
    I: mean(SAFIAVAL.Intuitive, prevSAFIAVAl?.Intuitive),
    F: mean(SAFIAVAL.Feeling, prevSAFIAVAl?.Feeling),
    A: mean(SAFIAVAL.Analytical, prevSAFIAVAl?.Analytical)
  };

  const updatedUser = await User.findOneAndUpdate(
    { name },
    {
      $set: {
        RIASEC_vals: riasecMapped,
        SIFA_vals: sifaMapped
      }
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
}
}
export default ValuesAnalyzer;
