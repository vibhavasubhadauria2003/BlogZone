import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";

import {
  registerUser,
  verifyUser,
  loginUser,
  updateProfileImage,
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/verify").post(verifyUser);
userRouter.route("/register").post(registerUser);

userRouter.route("/login").post(loginUser);
userRouter.route("/image").post(
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
  ]),
  updateProfileImage
);

export { userRouter };
