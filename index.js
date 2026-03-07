import dotenv from "dotenv";
dotenv.config();   // MUST be first

import express from "express";
import router from "./Routes.js";
import { connectDB } from "./Database/Main.js";

connectDB();
const app = express();
const port = 3000;

app.use(express.json());
app.use("/main", router);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});