import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  createUser,
  findUserByUsername,
} from "../services/database.service.js";

/**
 * Sign up a new user
 */
const signup = async (req, res) => {
  try {
    const { user_name, password, business_name } = req.body;

    // Check if user already exists
    const existingUser = await findUserByUsername(user_name);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await createUser({
      user_name,
      password: hashedPassword,
      business_name,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser.id,
        user_name: newUser.user_name,
        business_name: newUser.business_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: {
          id: newUser.id,
          user_name: newUser.user_name,
          business_name: newUser.business_name,
          created_at: newUser.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating user",
      error: error.message,
    });
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { user_name, password } = req.body;

    // Find user
    const user = await findUserByUsername(user_name);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        user_name: user.user_name,
        business_name: user.business_name,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" },
    );

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          user_name: user.user_name,
          business_name: user.business_name,
          created_at: user.created_at,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error.message,
    });
  }
};

/**
 * Get current user info
 */
const getMe = async (req, res) => {
  try {
    const user = await findUserByUsername(req.user.user_name);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        user_name: user.user_name,
        business_name: user.business_name,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching user data",
      error: error.message,
    });
  }
};

export { getMe, login, signup };
