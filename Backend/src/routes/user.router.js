import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import authUser from "../middlewares/authenticate.middleware.js";
import {
  registerUser,
  loginUser,
  updateUser,
  getUserProfile,
  logoutUser,
  uploadPost,
  likePost,
  commentOnPost,
  getallPosts,
  getMyPosts,
  deletePost,
  verifyAdmin,
  getallUsers,
  deleteUserCompletely,
} from "../controllers/user.controller.js";
import {
  sendVerificationCode,
  verifyUser,
} from "../controllers/auth.user.js";

const userRouter = Router();

userRouter.route("/send-verification-code").post(sendVerificationCode);
userRouter.route("/verify").post(verifyUser);

userRouter.route("/login").post(loginUser);

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
userRouter.route("/delete-post/:postId").delete(authUser, deletePost);
userRouter.route("/like").post(authUser, likePost);
userRouter.route("/comment").post(authUser, commentOnPost);
userRouter.route("/posts").get(authUser, getallPosts);
userRouter.route("/my-posts").get(authUser, getMyPosts);
userRouter.route("/verify-admin").patch(authUser, verifyAdmin);
userRouter.route("/all-users").get(authUser, getallUsers);
userRouter.route("/delete/:userId").delete(authUser, deleteUserCompletely);
userRouter.route("/").post(registerUser);
userRouter.route("/").get(authUser, getUserProfile);

export { userRouter };
