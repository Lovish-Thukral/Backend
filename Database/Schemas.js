import mongoose from "mongoose";

/* ---------------- CHAT MESSAGE ---------------- */

const chatSchema = new mongoose.Schema(
{
  role: {
    type: String,
    enum: ["user", "assistant", "system"],
    required: true
  },

  message: {
    type: String,
    required: true
  },

  time: {
    type: Date,
    default: Date.now
  }
},
{ _id: false }
);

/* ---------------- RIASEC SCORES ---------------- */

const riasecSchema = new mongoose.Schema(
{
  R: { type: Number, default: 0 }, // Realistic
  I: { type: Number, default: 0 }, // Investigative
  A: { type: Number, default: 0 }, // Artistic
  S: { type: Number, default: 0 }, // Social
  E: { type: Number, default: 0 }, // Enterprising
  C: { type: Number, default: 0 }  // Conventional
},
{ _id: false }
);

/* ---------------- SIFA SCORES ---------------- */

const sifaSchema = new mongoose.Schema(
{
  S: { type: Number, default: 0 },
  I: { type: Number, default: 0 },
  F: { type: Number, default: 0 },
  A: { type: Number, default: 0 }
},
{ _id: false }
);

/* ---------------- ROADMAP HISTORY ---------------- */

const roadMapSchema = new mongoose.Schema(
{
  topic: {
    type: String,
    required: true
  },

  level: {
    type: Number,
    required: true
  },

  completed: {
    type: Boolean,
    default: false
  }
},
{ _id: false }
);

/* ---------------- CURRENT LEVEL DATA ---------------- */

const currentLevelSchema = new mongoose.Schema(
{
  level: {
    type: Number,
    default: 1
  },

  topic: {
    type: String
  },

  progress: {
    type: Number,
    default: 0
  }
},
{ _id: false }
);

/* ---------------- USER SCHEMA ---------------- */

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

  /* CHAT HISTORY */

  chatHistory: {
    type: [chatSchema],
    default: []
  },

  /* PERSONALITY SCORES */

  RIASEC_vals: {
    type: riasecSchema,
    default: () => ({})
  },

  SIFA_vals: {
    type: sifaSchema,
    default: () => ({})
  },

  /* ROADMAP TRACKING */

  roadmapHistory: {
    type: [roadMapSchema],
    default: []
  },

  /* CURRENT LEARNING UNIT */

  currentUnit: {
    type: String,
    default: null
  },

  /* CURRENT LEVEL DATA */

  currentLevelData: {
    type: currentLevelSchema,
    default: () => ({})
  }

},
{
  timestamps: true
});

/* ---------------- MODEL ---------------- */

const User = mongoose.model("User", userSchema);

export default User;