import chatmodel from "./CoreModels";
import User from "../Database/Schemas";


function splitResult(resultString) {
  const parsed = JSON.parse(resultString);

  const riasec = parsed.RIASEC;
  const sifa = parsed.SIFA;

  return { riasec, sifa };
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
6. Output only the JSON object with RIASEC and SIFA scores, no explanations.

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
        model: "DeepSeek-r1-distill-qwen-32b",
        messages: [{ role: "system", content: prompt }],
      });

      const content = response.choices[0].message.content;
      const values = splitResult(content);
      return values;
    } catch (error) {
      console.error("Error analyzing values:", error);
      throw new Error("Failed to analyze values");
    }
  }

async StoreValues(data) {
  const { userid, RIASECval, SAFIAVAL } = data;

  const updatedUser = await User.findByIdAndUpdate(
    userid,
    {
      RIASEC_vals: RIASECval,
      SIFA_vals: SAFIAVAL
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
