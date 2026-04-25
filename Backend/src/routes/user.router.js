import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import auth from "../middlewares/authenticate.middleware.js";
import {
  registerUser,
  sendVerificationCode,
  verifyUser,
  loginUser,
  updateProfileImage,
  getUserProfile,
} from "../controllers/user.controller.js";

const userRouter = Router();
userRouter.route("/send-verification-code").post(sendVerificationCode);
userRouter.route("/verify").post(verifyUser);

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
userRouter.route("/").get(auth, getUserProfile);
userRouter.route("/").post(registerUser);

export { userRouter };
