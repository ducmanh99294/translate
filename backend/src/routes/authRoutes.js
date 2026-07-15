const express = require('express')
const router = express.Router()
const userCtrl = require("../controllers/userController");
const auth = require("../middlewares/authMiddleware");
const admin = require("../middlewares/adminMiddleware");
const passport = require("../controllers/passport");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

function requireGoogleOAuth(req, res, next) {
  if (!passport.isGoogleOAuthConfigured) {
    return res.status(503).json({ message: "Google OAuth chưa cấu hình." });
  }
  next();
}

router.get("/google", requireGoogleOAuth, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
  "/google/callback",
  requireGoogleOAuth,
  (req, res, next) => {
    if (req.query.error === "access_denied") {
      return res.redirect(`https://datn-z8rb.vercel.app/login?status=cancelled`);
    }
    next();
  },
  passport.authenticate("google", { session: false, failureRedirect: "https://datn-z8rb.vercel.app/login?status=failed" }),
  (req, res) => {
    const accessToken = generateAccessToken(req.user);
    const refreshToken = generateRefreshToken(req.user);
    res.cookie("accessToken", accessToken, { httpOnly: true, sameSite: "lax" });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, sameSite: "lax" });
    res.redirect("https://datn-z8rb.vercel.app");
  }
);

router.post("/register", userCtrl.register);
router.post("/verify", userCtrl.verifyEmail);
router.post("/login", userCtrl.login);
router.post("/refresh-token", userCtrl.refreshToken);
router.post("/logout", userCtrl.logout);
router.get("/me", auth, userCtrl.getMe);
router.put("/change-password", auth, userCtrl.changePassword);

router.get("/", auth, admin, userCtrl.getAllUsers);
router.put("/:id/ban", auth, admin, userCtrl.banUser);
router.put("/:id/unban", auth, admin, userCtrl.unbanUser);
router.delete("/users/:id", auth, admin, userCtrl.deleteUser);

module.exports = router