import { Router } from "express";
import { ChatCompletion } from "./Controllers/Chatting.js";

const router = Router();

router.post('/Chat', ChatCompletion);

export default router;