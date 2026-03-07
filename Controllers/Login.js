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