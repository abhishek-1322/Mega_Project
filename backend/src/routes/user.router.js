import {Router} from "express";
import { registerUser,loginUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();

// -----------Routes for user login and registration----------
router.post("/register", 
upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),
registerUser);

router.post("/login",upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]), loginUser);

// router.route("/register").post(registerUser);

// router.route("/login").post(loginUser);

export default router;