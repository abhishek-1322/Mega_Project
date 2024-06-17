import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updatedAccountDetails,
  updateUserAvatarImage,
  updateUserCoverImage,
  getWatchedHistory,
  getUserChannelProfile,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// -----------Routes for user login and registration----------
router.post(
  "/register",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.post("/login", loginUser);

router.post("/logout", verifyJWT, logoutUser);

router.post("/refreshToken", refreshAccessToken);

router.post("/changePassword", verifyJWT, changePassword);

router.get("/getCurrentUser", verifyJWT, getCurrentUser);

router.patch("/updatedAccountDetails", verifyJWT, updatedAccountDetails);

router.post(
  "/updateAvatarImage",
  verifyJWT,
  upload.single("avatar"),
  updateUserAvatarImage
);

router.post(
  "/updateCoverImage",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage
);

router.get("/getChannelProfile/:username", verifyJWT, getUserChannelProfile);

router.get("/getWatchHistory", verifyJWT, getWatchedHistory);

export default router;
