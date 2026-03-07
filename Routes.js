import { Router } from "express";
import { ChatCompletion } from "./Controllers/Chatting.js";
import { LoginUser } from "./Controllers/Login.js";

const router = Router();

router.post('/Chat', ChatCompletion);
router.post("/login", LoginUser);
// router.post

export default router;