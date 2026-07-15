const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendOtpMail } = require("../utils/sendMail");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email đã tồn tại" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = await bcrypt.hash(password, 10);

    const verifyToken = jwt.sign(
      { email, passwordHash, otp },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "5m" }
    );

    await sendOtpMail(email, otp);
    res.json({ message: "Đã gửi OTP", verifyToken });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { otp, verifyToken } = req.body;
    const data = jwt.verify(verifyToken, process.env.JWT_ACCESS_SECRET);

    if (data.otp !== otp) return res.status(400).json({ message: "Sai mã OTP" });

    const exists = await User.findOne({ email: data.email });
    if (exists) return res.status(400).json({ message: "Email đã tồn tại" });

    await User.create({ email: data.email, passwordHash: data.passwordHash });
    res.json({ message: "Xác thực thành công" });
  } catch (error) {
    res.status(400).json({ message: "OTP hết hạn hoặc token lỗi" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email không tồn tại" });

    if (user.isBanned) {
      return res.status(403).json({ message: "Tài khoản đã bị khoá", reason: user.banReason });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ message: "Sai mật khẩu" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, cookieOptions());
    res.cookie("refreshToken", refreshToken, cookieOptions());
    res.json({ message: "Đăng nhập thành công", role: user.role, plan: user.plan });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.sendStatus(401);

  const user = await User.findOne({ refreshToken });
  if (!user) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err) => {
    if (err) return res.sendStatus(403);
    const newAccessToken = generateAccessToken(user);
    res.cookie("accessToken", newAccessToken, cookieOptions());
    res.cookie("refreshToken", refreshToken, cookieOptions());
    res.json({ message: "Token refreshed" });
  });
};

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    await User.updateOne({ refreshToken }, { $set: { refreshToken: null } });
  }
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.json({ message: "Đã đăng xuất" });
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash -refreshToken");
  if (!user) return res.status(404).json({ message: "User không tồn tại" });
  if (user.isBanned) return res.status(403).json({ message: "Tài khoản đã bị khoá", reason: user.banReason });
  res.json(user);
};

exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: "Thiếu dữ liệu" });

    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu cũ" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search ? { email: { $regex: search, $options: "i" } } : {};

    const users = await User.find(query)
      .select("-passwordHash -refreshToken")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.json({ users, currentPage: Number(page), totalPages: Math.ceil(total / limit), totalUsers: total });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (req.user.id === id) return res.status(400).json({ message: "Không thể tự khoá chính mình" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = reason || "Vi phạm điều khoản";
    user.refreshToken = null;
    await user.save();
    res.json({ message: "User đã bị khoá" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = null;
    await user.save();
    res.json({ message: "User đã được mở khoá" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.id === id) return res.status(400).json({ message: "Không thể tự xoá chính mình" });

    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });
    res.json({ message: "Xoá người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};