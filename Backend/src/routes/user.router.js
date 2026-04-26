import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import authUser from "../middlewares/authenticate.middleware.js";
import {
  registerUser,
  sendVerificationCode,
  verifyUser,
  loginUser,
  updateUser,
  getUserProfile,
  logoutUser,
  uploadPost,
  likePost,
  commentOnPost
} from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/send-verification-code").post(sendVerificationCode);
userRouter.route("/verify").post(verifyUser);
userRouter.route("/").post(registerUser);

userRouter.route("/login").post(loginUser);

userRouter.route("/").get(authUser, getUserProfile);
userRouter.route("/update").patch(
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
  ]),
  authUser,
  updateUser
);
userRouter.route("/logout").get(authUser, logoutUser);
userRouter.route("/upload-post").post(
  upload.fields([
    {
      name: "postImage",
      maxCount: 1,
    },
  ]),
  authUser,
  uploadPost
);
userRouter.route("/like").post(authUser, likePost);
userRouter.route("/comment").post(authUser, commentOnPost);

export { userRouter };
