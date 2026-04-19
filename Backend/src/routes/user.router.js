import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyUser,
} from "../middlewares/authenticate.middleware.js";
import { registerUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter.route("/registers").post(
  upload.fields([
    {
      name: "profileImage",
      maxCount: 1,
    },
  ]),
  registerUser
);



export { userRouter };
