import router from "express";
import {isAuthenticated} from "../middlewares/auth.middleware.js";
import {authorizeRoles} from "../middlewares/authorization.middleware.js";
import {upload} from "../middlewares/multer.middleware.js";
import {
  registerUser,
  loginUser,
  updateRefreshToken,
  logoutUser,
  updateProfile,
  updateAvatar,
  updateCoverImage,
  getProfile,
  getAllStudents
} from "../controllers/user.controller.js";

const userRouter = router.Router();
 

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/refresh-token").post(updateRefreshToken);


//protected routes
userRouter.route("/logout").post(isAuthenticated , logoutUser);

userRouter.route("/update-profile").put(isAuthenticated ,upload.single("resume") , updateProfile);
userRouter.route("/update-avatar").put(isAuthenticated , upload.single("avatar"), updateAvatar);
userRouter.route("/update-cover-image").put(isAuthenticated , upload.single("coverImage"), updateCoverImage);

userRouter.route("/profile").get(isAuthenticated , getProfile);

// Get all students (admin only)
userRouter.route("/").get(
  isAuthenticated,
  authorizeRoles("admin"),
  getAllStudents
);



export default userRouter;
