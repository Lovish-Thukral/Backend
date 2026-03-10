import Analyzer from "../Core/Analyzer.js";
import User from "../Database/Schemas.js";

export async function CreateRoadmap(req, res) {
  const { name, goal, RIASECval, SAFIAVAL, Skills } = req.body;

  if (!name || !goal || !RIASECval || !SAFIAVAL || !Skills) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const analyzerInstance = new Analyzer();
    const roadmap = await analyzerInstance.createRoadmap({ name, goal, RIASECval, SAFIAVAL, Skills });

    if (!roadmap || !Array.isArray(roadmap.units) || roadmap.units.length === 0) {
      return res.status(500).json({ error: "Invalid roadmap format returned from analyzer" });
    }

    // Seed: unlock only the first chapter of unit 1
    roadmap.units[0].chapters[0].locked = false;

    const updatedUser = await User.findOneAndUpdate(
      { name },
      {
        $set: {                             
          
          roadmapHistory: [
            {
              topic: roadmap.requested_field || goal.field_query || goal,
              progress: 0,
              units: roadmap.units,
            },
          ],
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(201).json({
      message: "Roadmap created successfully",
      roadmap,
    });
  } catch (error) {
    console.error("CreateRoadmap Error:", error);
    res.status(500).json({ error: "Failed to create roadmap" });
  }
}

export async function MarkComplete(req, res) {
  const { name, Day, unitIndex } = req.body;

  // Validate BEFORE computing u
  if (name === undefined || unitIndex === undefined || Day === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const u = unitIndex - 1; // Convert to 0-based index

  try {
    // No .lean() — we need markModified and save
    const user = await User.findOne({ name });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const roadmap = user.roadmapHistory[0];

    if (!roadmap || !roadmap.units || roadmap.units.length === 0) {
      return res.status(404).json({ error: "Roadmap not found for this user" });
    }

    // Fixed: use u for both bounds checks
    if (u < 0 || u >= roadmap.units.length) {
      return res.status(400).json({ error: "Invalid unit index" });
    }

    const unit = roadmap.units[u];
    const chapterIndex = unit.chapters.findIndex((ch) => ch.day === Day);

    if (chapterIndex === -1) {
      return res.status(400).json({ error: `No chapter found for Day ${Day}` });
    }

    const chapter = unit.chapters[chapterIndex];

    if (chapter.completed) {
      return res.status(200).json({
        message: "Chapter already completed",
        updatedProgress: roadmap.progress,
      });
    }

    chapter.completed = true;

    const isLastChapterInUnit = chapterIndex + 1 >= unit.chapters.length;

    if (!isLastChapterInUnit) {
      unit.chapters[chapterIndex + 1].locked = false;
    } else {
      const nextUnit = roadmap.units[u + 1];
      if (nextUnit?.chapters?.length) {
        nextUnit.chapters[0].locked = false;
      }
    }

    // Fixed: renamed reduce params to avoid shadowing outer u
    const totalChapters = roadmap.units.reduce((sum, un) => sum + un.chapters.length, 0);
    const completedChapters = roadmap.units.reduce(
      (sum, un) => sum + un.chapters.filter((ch) => ch.completed).length,
      0
    );

    roadmap.progress = totalChapters > 0
      ? Math.round((completedChapters / totalChapters) * 100)
      : 0;

    user.markModified("roadmapHistory");
    await user.save();

    res.status(200).json({
      message: "Chapter marked as complete",
      updatedProgress: roadmap.progress,
      unlockedNext: !isLastChapterInUnit
        ? { unitIndex: u, day: unit.chapters[chapterIndex + 1].day }
        : roadmap.units[u + 1]
          ? { unitIndex: u + 1, day: roadmap.units[u + 1].chapters[0].day }
          : null,
    });
  } catch (err) {
    console.error("MarkComplete Error:", err);
    res.status(500).json({ error: "Failed to mark chapter complete" });
  }
}

export async function GetProgress(req, res) {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Missing name parameter" });
  }

  try {
    // .lean() is fine here — read only, no save needed
    const user = await User.findOne({ name }).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // roadmapHistory is an array — [0] is the active roadmap
    const roadmap = user.roadmapHistory[0];

    if (!roadmap || !roadmap.units || roadmap.units.length === 0) {
      return res.status(404).json({ error: "No roadmap found for this user" });
    }

    const summary = roadmap.units.map((unit) => ({
      unit_number: unit.unit_number,
      unit_title: unit.unit_title,
      completed: unit.chapters.filter((ch) => ch.completed).length,
      total: unit.chapters.length,
      currentDay: unit.chapters.find((ch) => !ch.completed && !ch.locked)?.day ?? null,
    }));

    res.status(200).json({
      topic: roadmap.topic,
      progress: roadmap.progress,
      totalDays: roadmap.units.reduce((sum, u) => sum + u.chapters.length, 0),
      summary,
    });
  } catch (err) {
    console.error("GetProgress Error:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
}