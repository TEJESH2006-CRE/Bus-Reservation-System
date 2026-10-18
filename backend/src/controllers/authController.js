const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const EmailJob = require("../models/EmailJob");
const User = require("../models/User");
const Operator = require("../models/Operator");

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check required fields
    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        message: "Name, email, phone and password are required",
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered",
      });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });

    if (existingPhone) {
      return res.status(400).json({
        message: "Phone number already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "customer",
    });

    // Create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }
    if (!user.isActive) {
  return res.status(403).json({
    message: "Your account has been deactivated",
  });
}

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Get profile error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // At least one field is required
    if (!name && !phone) {
      return res.status(400).json({
        message: "Name or phone is required",
      });
    }

    // Check if phone is already used by another user
    if (phone) {
      const existingPhone = await User.findOne({
        phone,
        _id: { $ne: req.user.id },
      });

      if (existingPhone) {
        return res.status(400).json({
          message: "Phone number already registered",
        });
      }
    }

    const updateData = {};

    if (name) {
      updateData.name = name.trim();
    }

    if (phone) {
      updateData.phone = phone.trim();
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const registerOperator = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      companyName,
      contactPerson,
      address,
    } = req.body;

    if (
      !name ||
      !email ||
      !phone ||
      !password ||
      !companyName ||
      !contactPerson
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
  $or: [{ email }, { phone }],
});

console.log("Checking email:", email);
console.log("Checking phone:", phone);
console.log("Existing user:", existingUser);

    if (existingUser) {
      return res.status(400).json({
        message: "Email or phone number already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "operator",
    });

    try {
      const operator = await Operator.create({
        user: user._id,
        companyName,
        contactPerson,
        phone,
        email,
        address,
        isApproved: false,
      });

      res.status(201).json({
        message: "Operator registered successfully. Waiting for admin approval.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        operator,
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  } catch (error) {
    console.error("Operator registration error:", error.message);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Use the same response whether or not the email exists.
    if (!user) {
      return res.status(200).json({
        message: "If that email is registered, a reset link will be sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const frontendUrl = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/+$/, "");

    const resetLink =
      `${frontendUrl}/reset-password/${resetToken}`;

    try {
      await EmailJob.create({
        to: user.email,
        subject: "BusGo Password Reset",
        message:
          `Hello ${user.name},\n\n` +
          `Use this link to reset your BusGo password:\n${resetLink}\n\n` +
          "This link expires in 15 minutes. If you did not request this, ignore this email.",
      });
    } catch (emailError) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      message: "If that email is registered, a reset link will be sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error.message);

    return res.status(500).json({
      message: "Unable to process the request right now.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        message: "Token and new password are required",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Reset link is invalid or has expired",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      message: "Password reset successful. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error.message);

    return res.status(500).json({
      message: "Unable to reset password right now.",
    });
  }
};



module.exports = {
  registerUser,
  registerOperator,
  loginUser,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
};
