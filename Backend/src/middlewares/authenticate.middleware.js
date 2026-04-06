import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const verifyUser = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.userToken;
  if (!token) {
    throw new ApiError(401, "Token not found");
  }
  const decordedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const user = decordedToken.user_username;
  if (!user) {
    throw new ApiError(401, "Unauthorized access");
  }
  req.user_username = user;
  console.log("Authenticated User: ", user);
  next();
});

export { verifyUser };
