import { Router } from "express";

import { upload } from "../middlewares/multer.middleware.js";
import {
  verifyUser,
} from "../middlewares/authenticate.middleware.js";

const userRouter = Router();



export { userRouter };
