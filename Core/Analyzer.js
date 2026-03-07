import chatmodel from "./CoreModels.js";
import User from "../Database/Schemas.js";

function splitResult(resultString) {

  // remove <think>...</think> blocks if the model outputs them
  const cleaned = resultString
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .trim()

  let parsed

  try {
    parsed = JSON.parse(cleaned)
  } catch (err) {
    throw new Error("Invalid JSON returned by model")
  }

  return {
    riasec: parsed.RIASEC || {},
    sifa: parsed.SIFA || {},
    skills: parsed.Skills || {}
  }
}

function mergeSkills(prevSkills, Skills) {
  const merged = { ...prevSkills };

  for (const [skill, level] of Object.entries(Skills)) {
    if (merged[skill] !== undefined) {
      // take mean of both values
      merged[skill] = (merged[skill] + level) / 2;
    } else {
      merged[skill] = level;
    }
  }

  return merged;
}

function parseRoadmapData(rawText) {
  try {
    const jsonStartIndex = rawText.indexOf('{');
    if (jsonStartIndex === -1) throw new Error("No JSON block found");

    const jsonOnly = rawText.slice(jsonStartIndex).trim();
    return JSON.parse(jsonOnly);
  } catch (err) {
    console.error("Failed to parse roadmap data:", err);
    return null;
  }
}

function mean(newVal, prevVal) {
  if (prevVal === undefined) {
    return newVal;
  }
  return Math.round((newVal + prevVal) / 2);
}

class Analyzer {
  async analyzeSkillValues(userInput) {
    const prompt = `System Prompt (Chat Personality Analysis)

Analyze a conversation between a user and assistant to estimate the user's interests, thinking style, and skills.

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

Extract skills ONLY if the user clearly states they possess or practice that skill.

Valid evidence examples:
- "I know Python"
- "I have built APIs"
- "I worked on debugging code"
- "I manage teams in college events"

Do NOT extract skills from:
- interests ("I like programming")
- curiosity ("I want to learn AI")
- suggestions given by the assistant
- career discussions without personal experience

Skill Levels
1 = beginner (learning or limited practice)
2 = intermediate (regular usage or projects)
3 = strong ability (deep experience, multiple projects, or professional use)

Strict Rule
Only include skills that the **user explicitly mentions having or doing**.
If no skills are clearly stated, return an empty Skills object.

Instructions
1. Focus mainly on the **user's messages**.
2. Identify patterns in interests and thinking style.
3. Score RIASEC and SIFA from **0–100**.
4. Extract relevant **skills from the conversation**.
5. Assign each skill a **level from 1–3**.
6. If the user has multiple messages, consider the **overall pattern and average tendencies**.
7. Output **only the JSON object**.

Output Format

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
  },
  "Skills": {
    "skill_name": level
  }
}

Examples

Example 1

User: I enjoy solving programming problems and understanding how systems work.  
Assistant: What part of programming do you like most?  
User: I like figuring out why something isn't working and debugging it.  
Assistant: So the logical side interests you?  
User: Yes, especially algorithms and system design. I enjoy breaking big problems into smaller steps.  
Assistant: Do you enjoy research or reading technical documentation?  
User: Definitely. I spend time reading about how databases and networks work.

Result

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
  },
  "Skills": {
    "Programming": 2,
    "Debugging": 2,
    "Algorithms": 2,
    "System Design": 1,
    "Technical Research": 2
  }
}

Example 2

User: I like organizing events in college and managing teams during competitions.  
Assistant: Do you enjoy leading people?  
User: Yes, I enjoy planning things and making sure everything runs smoothly.  
Assistant: What kind of tasks do you usually handle?  
User: Scheduling tasks, coordinating with people, and pitching ideas for projects.  
Assistant: Do you enjoy persuading people about your ideas?  
User: Yes, convincing people and building something together feels rewarding.

Result

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
  },
  "Skills": {
    "Team Management": 2,
    "Event Planning": 2,
    "Leadership": 2,
    "Coordination": 2,
    "Persuasion": 1
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

  async StoreSkillValues(data) {

  const { name, RIASECval, SAFIAVAL, prevRIASECval, prevSAFIAVAl, Skills, prevSkills } = data;

  const riasecMapped = {
    R: mean(RIASECval.Realistic, prevRIASECval?.Realistic),
    I: mean(RIASECval.Investigative, prevRIASECval?.Investigative),
    A: mean(RIASECval.Artistic, prevRIASECval?.Artistic),
    S: mean(RIASECval.Social, prevRIASECval?.Social),
    E :mean(RIASECval.Enterprising, prevRIASECval?.Enterprising),
    C: mean(RIASECval.Conventional, prevRIASECval?.Conventional)
  };

  const sifaMapped = {
    S: mean(SAFIAVAL.Sensing, prevSAFIAVAl?.Sensing),
    I: mean(SAFIAVAL.Intuitive, prevSAFIAVAl?.Intuitive),
    F: mean(SAFIAVAL.Feeling, prevSAFIAVAl?.Feeling),
    A: mean(SAFIAVAL.Analytical, prevSAFIAVAl?.Analytical)
  };

  const mergedSkills = mergeSkills(prevSkills || {}, Skills);
  console.log(mergedSkills);

  const updatedUser = await User.findOneAndUpdate(
    { name },
    {
      $set: {
        RIASEC_vals: riasecMapped,
        SIFA_vals: sifaMapped,
        skills: mergedSkills
      }
    },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser;
}

async createRoadmap(data) {

  const { goal, RIASECval, SAFIAVAL, Skills } = data;

  const field_query = goal?.field_query;
  const days = goal?.days;

  const RIASEC_vals = RIASECval;
  const SIFA_vals = SAFIAVAL;
  const skills = Skills;

  if (!RIASEC_vals || !SIFA_vals || !skills) {
    throw new Error("Missing required user profile fields.");
  }

  if (!field_query || typeof field_query !== "string" || !field_query.trim()) {
    throw new Error("field_query must be a non-empty string.");
  }

  if (!Number.isInteger(days) || days < 5 || days > 365) {
    throw new Error("days must be an integer between 5 and 365.");
  }

  const prompt = `You are an AI Learning Planner. Generate a personalized learning roadmap as JSON only — no prose, no markdown.

INPUT
${JSON.stringify(
  { field_query, days, RIASEC: RIASEC_vals, SIFA: SIFA_vals, skills },
  null,
  2
)}

PROFILE RULES
- Top 2–3 RIASEC values determine learning direction
- Existing skills (1–3) skip basics or increase difficulty
- SIFA style controls learning approach:
  Analytical → structured progression
  Sensing → practical tasks
  Intuitive → conceptual exploration
  Feeling → collaborative projects

ROADMAP RULES
- Units must contain 5–10 chapters
- Total chapters = ${days}
- Each chapter = 1 learning day
- Progression: Beginner → Intermediate → Advanced

ALTERNATIVES
Suggest 2 alternative fields aligned with the user's strengths.

OUTPUT JSON
{
  "requested_field": "${field_query}",
  "recommended_alternatives": ["field_1","field_2"],
  "total_days": ${days},
  "units": [
    {
      "unit_number": 1,
      "unit_title": "string",
      "chapters": [
        { "day": 1, "title": "string", "focus": "specific task" }
      ]
    }
  ]
}

HARD RULES
- total chapters must equal ${days}
- each unit 5–10 chapters
- return JSON only`;

  const response = await chatmodel.chat.completions.create({
    model: "qwen/qwen3-32b",
    messages: [{ role: "system", content: prompt }],
    temperature: 0.6,
    max_completion_tokens: 4096,
    top_p: 0.95
  });

  const roadmapData = parseRoadmapData(response.choices[0].message.content);
  if (!roadmapData) {
    throw new Error("Failed to parse roadmap data");
  }

  return roadmapData;
}

async storeRoadmap(name, roadmap) {
  const updatedUser = await User.findOneAndUpdate(
    { name },
    { $set: { roadmap } },
    { new: true }
  );

  if (!updatedUser) {
    throw new Error("User not found");
  }

  return updatedUser; }

}

export default Analyzer;
