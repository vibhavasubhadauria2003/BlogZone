import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const verifyPerson = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.personToken;
  if (!token) {
    throw new ApiError(401, "Token not found");
  }
  const decordedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const person = decordedToken.person_username;
  if (!person) {
    throw new ApiError(401, "Unauthorized access");
  }
  req.person_username = person;
  console.log("Authenticated Person: ", person);
  next();
});

export { verifyPerson };
