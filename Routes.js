import { Router } from "express";
import { ChatCompletion } from "./Controllers/Chatting.js";
import { LoginUser } from "./Controllers/Login.js";
import { UpdateScoringVals } from "./Controllers/UpdateUser.js";
const router = Router();

router.post('/Chat', ChatCompletion);
router.post("/login", LoginUser);
router.post("/updateScoringVals", UpdateScoringVals);

export default router;