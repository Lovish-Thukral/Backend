import chatmodel from "../Core/CoreModels.js";
import User from "../Database/Schemas.js";

export async function FetchTasks(req, res) {
  const { name, unitIndex, day } = req.body;

  if (!name || unitIndex === undefined || day === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user = await User.findOne({ name }).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roadmap = user.roadmapHistory[0];

    if (!roadmap) {
      return res.status(404).json({ error: "Roadmap not found" });
    }

    const unit = roadmap.units[unitIndex];

    if (!unit) {
      return res.status(404).json({ error: "Unit not found" });
    }

    const chapterIndex = unit.chapters.findIndex(
      (c) => c.day === Number(day)
    );

    if (chapterIndex === -1) {
      return res.status(404).json({ error: "Day not found" });
    }

    const chapter = unit.chapters[chapterIndex];

    // If tasks already exist return them
    if (chapter.tasks && chapter.tasks.length > 0) {
      return res.status(200).json({
        day: chapter.day,
        topic: chapter.title,
        tasks: chapter.tasks
      });
    }

    const prompt = `
Generate 5-10 actionable learning tasks for the topic "${chapter.title}" in the unit "${unit.unit_title}".

Return ONLY a JSON array like this:

[
  {
    "title": "Task title",
    "description": "Short explanation"
  }
]

Do not include any text before or after the JSON.
`;

    const response = await chatmodel.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You generate structured learning tasks."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const raw = response.choices[0].message.content;

    let tasks = [];

    try {
      const start = raw.indexOf("[");
      const end = raw.lastIndexOf("]") + 1;
      const json = raw.slice(start, end);

      tasks = JSON.parse(json);
    } catch (err) {
      console.error("Task JSON parse failed:", err);
      tasks = [];
    }

    // Save tasks directly in nested Mongo field
    await User.updateOne(
      { name },
      {
        $set: {
          [`roadmapHistory.0.units.${unitIndex}.chapters.${chapterIndex}.tasks`]: tasks
        }
      }
    );

    return res.status(200).json({
      day: chapter.day,
      topic: chapter.title,
      tasks
    });

  } catch (error) {
    console.error("FetchTasks error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}