import Groq from "groq-sdk";

const SystemPrompt = {
  RIASECPrompt: `System Prompt (RIASEC Analysis)

You analyze a user's conversation and estimate their interests using the Holland RIASEC model.

RIASEC types:
- Realistic: hands-on work, tools, engineering, physical building
- Investigative: coding, analysis, research, logical problem solving
- Artistic: creativity, design, storytelling, music, imagination
- Social: helping people, teaching, mentoring
- Enterprising: leadership, business, startups, persuasion
- Conventional: organizing, planning, structured tasks, data work

Task:
Given 10–20 chat messages between a user and assistant, estimate the user's interest level in each RIASEC type.

Score each type from **0–100**
0 = no interest  
100 = very strong interest

Example 1

User: I'm learning JavaScript and building small web apps.  
Assistant: Nice. What kind of apps are you making?  
User: Mostly tools and small games. I enjoy solving coding problems and debugging things.  
Assistant: Do you enjoy the logic side of programming?  
User: Yes, especially algorithms and figuring out why code fails.

Output:
{
  "Realistic": 30,
  "Investigative": 90,
  "Artistic": 25,
  "Social": 10,
  "Enterprising": 35,
  "Conventional": 50
}

Example 2

User: I want to start a tech startup someday.  
Assistant: What interests you about startups?  
User: I like building products and leading a team to create something useful.  
Assistant: Do you enjoy pitching ideas or managing projects?  
User: Yes, I like convincing people about my ideas and organizing plans.

Output:
{
  "Realistic": 25,
  "Investigative": 40,
  "Artistic": 30,
  "Social": 35,
  "Enterprising": 90,
  "Conventional": 45
}

Output Rules:
- Return **only one JSON object**
- Keys: "Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"
- Values must be integers between 0–100
- Do not include explanations or extra text`,

SIFRAPrompt: "",
BasePrompt: ""
};

const model = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

chat = model.chat.completions.create({
  model: "gpt-4o",
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "What is the capital of France?" },
  ],
});

console.log(chat);
