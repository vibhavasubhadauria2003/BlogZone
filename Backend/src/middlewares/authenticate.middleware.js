import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const authUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.userAccessToken;

  console.log("Token from cookie:", token);

  if (!token) {
    throw new ApiError(401, "Token not found");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = decodedToken;

  if (!user) {
    throw new ApiError(401, "User not found in token");
  } 
  req.email = user.email;
  req._id = user._id;

  next();
});

export default authUser;
