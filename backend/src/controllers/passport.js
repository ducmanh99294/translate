const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

const isGoogleOAuthConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

if (isGoogleOAuthConfigured) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("Google account không có email"), null);

          let user = await User.findOne({ email });

          if (!user) {
            // User model đang bắt buộc passwordHash — user đăng nhập Google
            // không có mật khẩu thật, nên tạo placeholder không thể login bằng password thường.
            // Cân nhắc thêm field `googleId` + đổi `passwordHash` thành không bắt buộc nếu dùng OAuth nhiều.
            user = await User.create({
              email,
              passwordHash: "google-oauth-" + profile.id,
            });
          }

          return done(null, user);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
} else {
  console.warn(
    "[passport] Google OAuth chưa cấu hình — thiếu GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET trong .env"
  );
}

passport.isGoogleOAuthConfigured = isGoogleOAuthConfigured;

module.exports = passport;