import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";

import { registerUser, verifyUser,loginUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/register").post(
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
  ]),
  registerUser
);
userRouter.route("/verify").post(verifyUser);
userRouter.route("/login").post(loginUser);

export { userRouter };
