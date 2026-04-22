import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary, deleteOnCloudinary } from "../utils/Cloudinary.js";
import { sendEmail } from "../utils/SendMail.js";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const userAccessToken = await user.generateAccessToken();
    const userRefreshToken = await user.generateRefreshToken();
    user.refreshToken = userRefreshToken;
    await user.save({ validateBeforeSave: false });
    return { userAccessToken, userRefreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Access and Refresh Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, fullName, dob, gender, password } = req.body;
  if (!fullName || !email || !password || !dob || !gender) {
    throw new ApiError(400, "All fields are required");
  }
  // Check if user already exists
  console.log(email, fullName, dob, gender, password);
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  console.log("User does not exist, proceeding with registration");
  const profileImagePath = req.files?.profileImage[0]?.path;
  if (!profileImagePath) {
    throw new ApiError(400, "Profile Image file is required");
  }
  console.log(profileImagePath);
  const profileImage = await uploadOnCloudinary(profileImagePath);
  console.log(profileImage);
  if (!profileImage) {
    throw new ApiError(400, "Cloudinary Profile Image link is unavilable");
  }
  const verificationcode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  console.log("Verification Code: ", verificationcode);
  console.log("Profile Image Uploaded to Cloudinary: ", profileImage.url);
  
  try {
    const user = await User.create({
      email: email,
      fullName,
      profileImage: profileImage.url,
      dob,
      gender,
      password,
      verificationcode,
    });
    if (!user) {
      throw new ApiError(500, "Error while registering on DB");
    }
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    console.log("User created in DB: ", createdUser);
    if (!createdUser) {
      throw new ApiError(500, "Error while registering on DB");
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
    .status(201)
    .cookie("emailToken", email, options)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
 } catch (error) {
    if (profileImage?.public_id) {
      await deleteOnCloudinary(profileImage.public_id);
    }
    console.error("Error during user registration: ", error);
    throw new ApiError(500, "Error while registering on DB");
  }});


const verifyUser = asyncHandler(async (req, res) => {
  try {
    const { emailToken } = req.cookies;
    const { verificationcode } = req.body;
    if (!emailToken) {
      throw new ApiError(400, "Email token is missing");
    }
    if (!verificationcode) {
      throw new ApiError(400, "Verification code is required");
    }
    const user = await User.findOne({ email: emailToken });
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (user.isVerified) {
      throw new ApiError(400, "User is already verified");
    }
    if (user.verificationcode !== verificationcode) {
      throw new ApiError(400, "Invalid verification code");
    }
    user.isVerified = true;
    user.verificationcode = null;
    await user.save({ validateBeforeSave: false });
    console.log("User verified successfully: ", user);
    return res
      .status(200)
      .json(new ApiResponse(200, user, "User verified successfully"));
  } catch (error) {
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Internal Server Error"
    );
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
  if (!user.isVerified) {
    throw new ApiError(400, "User is not verified");
  }
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password incorrect");
  }
  const { userAccessToken, userRefreshToken } = await generateAccessandRefreshToken(
    user._id
  );
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
    .cookie("userRefreshToken", userRefreshToken, options)
    .json(new ApiResponse(200, updatedUser, "User logged in successfully"));
});

export { registerUser, verifyUser ,loginUser};
