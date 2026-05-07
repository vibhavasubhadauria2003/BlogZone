import { Code } from "../models/code.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail } from "../utils/SendMail.js";
import { User } from "../models/user.model.js";

const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
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
  console.log(
    "Verifying user with email: ",
    email,
    " and code: ",
    verificationcode
  );
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
    const updatedCode = await Code.findByIdAndUpdate(
      code._id,
      {
        isVerified: true,
      },
      {
        new: true,
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


export {
  sendVerificationCode,
  verifyUser,
};