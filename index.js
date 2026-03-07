import dotenv from "dotenv";
dotenv.config();   // MUST be first

import express from "express";
import router from "./Routes.js";
import { connectDB } from "./Database/Main.js";
import cors from "cors";


connectDB();
const app = express();
app.use(cors());
const port = 3000;

app.use(express.json());
app.use("/main", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});