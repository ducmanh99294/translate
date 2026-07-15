import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ display: "flex", gap: 16, padding: "12px 20px", borderBottom: "1px solid #eee" }}>
      <Link to="/" style={{ fontWeight: 700 }}>📖 Đọc Truyện Dịch</Link>
      <Link to="/login">Đăng nhập</Link>
    </nav>
  );
}