import mongoose from "mongoose";

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

const riasecSchema = new mongoose.Schema(
{
  R: { type: Number, default: 0 },
  I: { type: Number, default: 0 },
  A: { type: Number, default: 0 },
  S: { type: Number, default: 0 },
  C: { type: Number, default: 0 }
},
{ _id: false }
);

const sifaSchema = new mongoose.Schema(
{
  S: { type: Number, default: 0 },
  I: { type: Number, default: 0 },
  F: { type: Number, default: 0 },
  A: { type: Number, default: 0 }
},
{ _id: false }
);

const roadMapSchema = new mongoose.Schema(
{
  topic: String,
  level: Number,
  completed: {
    type: Boolean,
    default: false
  }
},
{ _id: false }
);

const currentLevelSchema = new mongoose.Schema(
{
  level: Number,
  topic: String,
  progress: {
    type: Number,
    default: 0
  }
},
{ _id: false }
);

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

  // CHAT ARRAY (stores all previous messages)
  chatHistory: {
    type: [chatSchema],
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
    type: [roadMapSchema],
    default: []
  },

  currentUnit: {
    type: [String],
    default: []
  },

  currentLevelData: {
    type: currentLevelSchema,
    default: () => ({})
  }

},
{
  timestamps: true
});

const User = mongoose.model("User", userSchema);

export default User;