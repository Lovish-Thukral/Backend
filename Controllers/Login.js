import User from "../Database/Schemas.js";

export async function LoginUser(req, res) {
  const { name, password } = req.body;

  if (!name || !password) {
    return res.status(400).json({
      error: "Username and password are required"
    });
  }

  try {
    const user = await User.findOne({ name });

    // If user doesn't exist → create
    if (!user) {
      const newUser = new User({ name, password });
      await newUser.save();

      const { password: _, ...safeUser } = newUser.toObject();

      return res.json({
        message: "User created and logged in",
        user: safeUser
      });
    }

    // Check password
    if (user.password !== password) {
      return res.status(401).json({
        error: "Incorrect password"
      });
    }

    const { password: _, ...safeUser } = user.toObject();

    res.json({
      message: "Login successful",
      user: safeUser
    });

  } catch (err) {
    res.status(500).json({
      error: "Server error"
    });
  }
}

export async function RefreshUser(req, res) {

  const { userID } = req.body;

  if (!userID) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {

    const user = await User.findById(userID).lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      message: "User data refreshed",
      user
    });

  } catch (error) {

    console.error("RefreshUser error:", error);

    return res.status(500).json({
      error: "Failed to fetch user data"
    });

  }

} 