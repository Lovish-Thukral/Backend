import Analyzer from "../Core/Analyzer.js";
import User from "../Database/Schemas.js";

export async function CreateRoadmap(req, res) {
  const { name, goal, RIASECval, SAFIAVAL, Skills } = req.body;

  if (!name || !goal || !RIASECval || !SAFIAVAL || !Skills) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const analyzerInstance = new Analyzer();

    // Run analyzer and get roadmap
    const roadmap = await analyzerInstance.createRoadmap({
      name,
      goal,
      RIASECval,
      SAFIAVAL,
      Skills
    });

    if (!roadmap || !roadmap.units || !Array.isArray(roadmap.units)) {
      return res.status(500).json({ error: "Invalid roadmap format" });
    }

    // Safely push roadmap into user document
    const updatedUser = await User.findOneAndUpdate(
      { name },
      {
        $push: {
          roadmapHistory: {
            topic: roadmap.requested_field || goal.field_query,
            progress: 0,
            units: roadmap.units
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" , updatedUser});
    }

    res.json({
      message: "Roadmap created successfully",
      roadmap
    });
  } catch (error) {
    console.error("CreateRoadmap Error:", error);
    res.status(500).json({ error: "Failed to create roadmap" });
  }
}


export async function MarkComplete(req, res ){
    const {name, unitIndex, ChapterIndex} = req.body;
    

    
}