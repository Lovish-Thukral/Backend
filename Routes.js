import { Router } from "express";
import { ChatCompletion } from "./Controllers/Chatting.js";
import { LoginUser } from "./Controllers/Login.js";
import { UpdateScoringVals } from "./Controllers/UpdateUser.js";
import { CreateRoadmap } from "./Controllers/Roadmap.js";
import { MarkComplete } from "./Controllers/Roadmap.js";
import { GetProgress } from "./Controllers/Roadmap.js";
import { FetchTasks } from "./Controllers/FetchTasks.js";
const router = Router();

router.post('/Chat', ChatCompletion);
router.post("/login", LoginUser);
router.post("/updateScoringVals", UpdateScoringVals);
router.post("/createRoadmap", CreateRoadmap);
router.post("/markComplete", MarkComplete);
router.post("/getProgress", GetProgress);
router.post("/FetchTasks", FetchTasks);

export default router;