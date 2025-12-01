export default function NotFound() {
  return (
    <div style={{
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      color: "#fff",
      background: "#111",
      textAlign: "center",
      padding: "20px"
    }}>
      <h1 style={{ fontSize: "4rem", marginBottom: "10px" }}>404</h1>
      <p style={{ fontSize: "1.3rem", opacity: 0.8 }}>
        The page you are looking for does not exist.
      </p>
    </div>
  );
}
