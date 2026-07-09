import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: 80,
        background: "linear-gradient(135deg, #022c22 0%, #065f46 50%, #059669 100%)",
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        CED
      </div>
      <div
        style={{
          fontSize: 36,
          color: "#a7f3d0",
          letterSpacing: "-0.01em",
          marginTop: 16,
        }}
      >
        Center for Environment & Development
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#6ee7b7",
          marginTop: 32,
          opacity: 0.8,
        }}
      >
        Environmental Management & Sustainable Development
      </div>
    </div>,
    size,
  );
}
