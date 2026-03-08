import mongoose from "mongoose";

// Chat messages inside sessions
const chatSchema = new mongoose.Schema(
  {
    role: String,
    message: String,
    time: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

// RIASEC scores
const riasecSchema = new mongoose.Schema(
  {
    R: { type: Number, default: 0 },
    I: { type: Number, default: 0 },
    A: { type: Number, default: 0 },
    S: { type: Number, default: 0 },
    E: { type: Number, default: 0 },
    C: { type: Number, default: 0 }
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
{
  title: String,
  description: String
},
{ _id: false }
);

// SIFA scores
const sifaSchema = new mongoose.Schema(
  {
    S: { type: Number, default: 0 },
    I: { type: Number, default: 0 },
    F: { type: Number, default: 0 },
    A: { type: Number, default: 0 }
  },
  { _id: false }
);


// Roadmap chapter
const chapterSchema = new mongoose.Schema(
  {
    day: Number,
    title: String,
    focus: String,
   tasks: {
    type: [taskSchema],
    default: []
  },
    completed : {
      type: Boolean,
      default: false
    },
    locked: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

// Roadmap unit
const unitSchema = new mongoose.Schema(
  {
    unit_number: Number,
    unit_title: String,
    chapters: [chapterSchema]
  },
  { _id: false }
);



// Entire roadmap
const roadmapSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true },
    progress: { type: Number, default: 0 },
    units: { type: [unitSchema], default: [] }
  },
  { _id: false }
);

// Main user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    // Array of chat sessions (each session = array of messages)
    chatHistory: {
      type: [[chatSchema]],
      default: []
    },

    RIASEC_vals: {
      type: riasecSchema,
      default: () => ({})
    },

    SIFA_vals: {
      type: sifaSchema,
      default: () => ({})
    },

    roadmapHistory: {
      type: [roadmapSchema],
      default: []
    },
    
    skills: { 
      type: Map, 
      of: Number,
      default: {}
    },

    currentUnit: {
      type: [String],
      default: []
    },
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

export default User;