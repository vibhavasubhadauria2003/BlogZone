import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Code } from "../models/code.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";
import { sendEmail } from "../utils/SendMail.js";
import e from "express";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const userAccessToken = await user.generateAccessToken();
    return { userAccessToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};

const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const existingEmail = await Code.findOne({ email });
  if (existingEmail) {
    console.log("Verification code already sent to this email: ", email);
    try {
      await Code.findByIdAndDelete(existingEmail._id);
    } catch (error) {
      console.error("Error while deleting existing verification code: ", error);
      throw new ApiError(500, "Error while deleting verification code");
    }
  }
  const verificationcode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  try {
    const code = await Code.create({
      email,
      verificationcode,
      isVerified: false,
    });
    if (!code) {
      throw new ApiError(500, "Error while inputing verification code on DB");
    }
    const sendEmailResult = sendEmail(
      email,
      "Email Verification for BlogZone",
      `Your verification code is: ${verificationcode}`,
      `<p>Your verification code is: <strong>${verificationcode}</strong></p>`
    );
    if (!sendEmailResult) {
      await User.findByIdAndDelete(createdUser._id);
      throw new ApiError(500, "Error while sending verification email");
    }
    console.log("Verification email sent successfully to ", email);
    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          null,
          "Verification code sent to email successfully"
        )
      );
  } catch (error) {
    console.error("Error during user registration: ", error);
    throw new ApiError(500, "Error while inputing verification code on DB");
  }
});

const verifyUser = asyncHandler(async (req, res) => {
  const { email, verificationcode } = req.body;
  if (!email || !verificationcode) {
    throw new ApiError(400, "Email and verification code are required");
  }
  const code = await Code.findOne({ email });
  if (!code) {
    throw new ApiError(404, "Verification code not found for this email");
  }
  if (code.verificationcode !== verificationcode) {
    throw new ApiError(400, "Invalid verification code");
  }

  try {
    const updatedCode = await Code.findByIdAndUpdate(code._id, 
      { 
        isVerified: true 
      },
      { 
        new: true
      }
    );
  } catch (error) {
    console.error("Error while updating verification code status: ", error);
    throw new ApiError(500, "Error while verifying code on DB");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Verification code is valid"));
});

const registerUser = asyncHandler(async (req, res) => {
  const { email, userName, fullName, dob, gender, password } = req.body;
  if (!fullName ||!userName || !email || !password || !dob || !gender) {
    throw new ApiError(400, "All fields are required");
  }
  // Check if user already exists
  console.log(email, userName, fullName, dob, gender, password);
  let existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  existingUser = await User.findOne({ userName });
  if (existingUser) {
    throw new ApiError(409, "User with this username already exists");
  }
  console.log("User does not exist, proceeding with registration");
  const code = await Code.findOne({ email});
  if (!code) {
    throw new ApiError(404, "Verification code not found for this email");
  }
  if (!code.isVerified) {
    throw new ApiError(400, "Email not verified. Please verify your email before registering");
  }
  try {
    const user = await User.create({
      email: email,
      userName,
      fullName,
      dob,
      gender,
      password,
    });
    if (!user) {
      throw new ApiError(500, "Error while registering on DB");
    }
    await Code.findByIdAndDelete(code._id);
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    console.log("User created in DB: ", createdUser);
    if (!createdUser) {
      throw new ApiError(500, "Error while registering on DB");
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    };
    return res
      .status(201)
      .cookie("emailToken", email, options)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    if (profileImage?.public_id) {
      await deleteOnCloudinary(profileImage.public_id);
    }
    console.error("Error during user registration: ", error);
    throw new ApiError(500, "Error while registering on DB");
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }
  const { userAccessToken } = await generateAccessandRefreshToken(user._id);
  const updatedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
  };
  return res
    .status(200)
    .cookie("userAccessToken", userAccessToken, options)
    .json(new ApiResponse(200, updatedUser, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    expires: new Date(0),
  };
  return res
    .status(200)
    .clearCookie("userAccessToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
  console.log(req.user_email);
  const user = await User.findOne({ email: req.user_email }).select(
    "-password -refreshToken"
  );
  if (!user) {
    throw new ApiError(404, "User not found Please login again");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile retrieved successfully"));
});

const updateProfileImage = asyncHandler(async (req, res) => {
  const profileImage = req.files?.profileImage?.[0];
  if (!profileImage) {
    throw new ApiError(400, "Profile image is required");
  }
});

export { registerUser, sendVerificationCode,verifyUser, loginUser, logoutUser, getUserProfile, updateProfileImage };
