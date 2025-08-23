import express from "express";

import {
  registerController,
  loginController,
  adminLoginController,
  testController,
  forgotPasswordController,
  updateProfileController,
  verifyTokenController,
  logoutController,
} from "../controllers/authController.js";
import { requireSignIn, isAdmin } from "../Middlewares/authMiddlewares.js";
//router object
const router = express.Router();

//get all user


//routing
//REGISTER || METHOD POST
router.post("/register", registerController);


//LOGIN 
router.post("/login", loginController);

//ADMIN LOGIN 
router.post("/admin-login", adminLoginController);

//forget passworrd || post
router.post("/ForgetPassword", forgotPasswordController);

//verify token for persistent sessions
router.post("/verify-token", verifyTokenController);

//logout
router.post("/logout", logoutController);

//test routes
router.get("/test", requireSignIn, isAdmin, testController);

//protected route auth
//user
router.get("/user-auth", requireSignIn, (req, res) => {
  res.status(200).send({ ok: true });
});
//adminn
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
  res.status(200).send({ ok: true });
});

//update profile
router.put("/profile", updateProfileController);

export default router;