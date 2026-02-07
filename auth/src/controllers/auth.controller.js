const { hashSync } = require("bcryptjs");
const userModel = require("../modules/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const redis = require("../db/redis");

async function registerUser(req, res) {
  try {
    const { username, email, password, fullname:{ firstName, lastName }, role } = req.body;

    const isUserAlreadyExists = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "User with this email or username already exists"
      });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      username,
      email,
      password: hash,
      fullname: { firstName, lastName },
      role: role || "user",
    });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: "User created",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        addresses: user.addresses,
      },
    });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function loginUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const user = await userModel.findOne({ $or: [{ email }, { username }] }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = await userModel
      .findById(req.userId)
      .select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Get current user fetch successful",
      user
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function logoutUser(req, res) {
    const token = req.cookies.token;
    if (token) {
        // Optionally, you can blacklist the token in Redis here
        await redis.set(`blacklist_${token}`, 'true', 'EX', 60 * 60); // Blacklist for 1 hour
    }

    res.clearCookie("token");
    return res.status(200).json({ message: "Logout successful" });
}

async function getUserAddresses(req, res) {
    const id = req.userId;
    const user = await userModel.findById(id).select('addresses');

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
        message: "User addresses fetched successfully",
        addresses: user.addresses
    });
}

async function addUserAddress(req, res) {
    const id = req.userId;
    const { street, city, state, pincode, country, phone, isDefault } = req.body;

    // Step 1: fetch minimal user data to decide default
    const user = await userModel.findById(id).select('addresses');
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // Step 2: decide default logically
    const makeDefault = isDefault === true || user.addresses.length === 0;

    // Step 3: if new address should be default → unset existing defaults
    if (makeDefault) {
        await userModel.updateOne(
            { _id: id },
            { $set: { "addresses.$[].isDefault": false } }
        );
    }

    // Step 4: push the new address
    const updatedUser = await userModel.findOneAndUpdate(
        { _id: id },
        {
            $push: {
                addresses: {
                    street,
                    city,
                    state,
                    pincode,
                    country,
                    phone,
                    isDefault: makeDefault
                }
            }
        },
        { new: true }
    );

    return res.status(201).json({
        message: "Address added successfully",
        address: updatedUser.addresses[updatedUser.addresses.length - 1]
    });
}

async function deleteUserAddress(req, res) {
    const id = req.userId;
    const { addressId } = req.params;

    // 1️⃣ Find user first
    const user = await userModel.findById(id);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    // 2️⃣ Check if address exists
    const addressIndex = user.addresses.findIndex(
        addr => addr._id.toString() === addressId
    );

    if (addressIndex === -1) {
        return res.status(404).json({ message: "Address not found" });
    }

    // 3️⃣ Remove address
    user.addresses.splice(addressIndex, 1);

    await user.save();

    return res.status(200).json({
        message: "Address deleted successfully",
        addresses: user.addresses
    });
}


module.exports = {
    registerUser,
    loginUser,
    getCurrentUser,
    logoutUser,
    getUserAddresses,
    addUserAddress,
    deleteUserAddress
};