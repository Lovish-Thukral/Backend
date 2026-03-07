import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();


const chatmodel = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export default chatmodel;