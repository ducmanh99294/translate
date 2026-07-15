export default function Loader({ text = "Đang tải..." }) {
  return (
    <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
      {text}
    </div>
  );
}