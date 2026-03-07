import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./Schemas.js";

dotenv.config();

const connectDB = async () => {
  const dbUri = process.env.mongoURI;
  try {
    await mongoose.connect(dbUri);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Database connection error:", err.message);
  }
};

const addUser = async (userData) => {
  try {
    const user = new User(userData);
    await user.save();
    return user;
  } catch (err) {
    console.error("Error adding user:", err.message);
  }
};

export { connectDB, addUser };