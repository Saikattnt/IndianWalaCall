import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import { Meeting } from "../models/meeting.model.js";

import crypto from "crypto";

//LOGIN

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    //subject to change
    return res.status(400).json({ message: "Please Provide mentioned fields" });
  }

  try {
    const user = await User.findOne({ username }); //findOne is use for unique search of one single document
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User Not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.token = token;
    await user.save();

    return res.status(httpStatus.OK).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
      },
    });
  } catch (e) {
    return res
      .status(500)
      .json({ message: `Something went Wrong ${e.message || e}` });
  }
};

//REGISTER

const register = async (req, res) => {
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(httpStatus.FOUND)
        .json({ message: "User already exists" }); //early return statements (not nesting loops)
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: name,
      username: username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(httpStatus.CREATED).json({ message: "User Registered" });
  } catch (e) {
    res.json({ message: `Something went wrong ${e}` });
  }
};

const getUserHistory = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res
      .status(400)
      .json({ message: "Token is required to fetch history" });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    const meetings = await Meeting.find({ user_id: user.username }).sort({
      date: -1,
    });
    return res.status(httpStatus.OK).json(meetings);
  } catch (e) {
    return res
      .status(500)
      .json({ message: `Something went wrong ${e.message || e}` });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;

  if (!token || !meeting_code) {
    return res
      .status(400)
      .json({ message: "Token and meeting_code are required" });
  }

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid token" });
    }

    const newMeeting = new Meeting({
      user_id: user.username,
      meetingCode: meeting_code,
    });

    await newMeeting.save();

    return res
      .status(httpStatus.CREATED)
      .json({ message: "Added code to history" });
  } catch (e) {
    return res
      .status(500)
      .json({ message: `Something went wrong ${e.message || e}` });
  }
};

export { login, register, getUserHistory, addToHistory };
