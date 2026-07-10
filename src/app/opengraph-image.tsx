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
          fontSize: 64,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        Centre for Environment and Development
      </div>
      <div
        style={{
          fontSize: 30,
          color: "#d1fae5",
          letterSpacing: "-0.01em",
          marginTop: 16,
        }}
      >
        Research and Consultancy Services
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#a7f3d0",
          marginTop: 30,
          maxWidth: 980,
          lineHeight: 1.4,
        }}
      >
        Chhagoedhing, Dolaygang Road, Simtokha E4 zone, Thimphu Thromde, Bhutan
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#a7f3d0",
          marginTop: 18,
          lineHeight: 1.4,
        }}
      >
        Website: www.cedbhutan.com
      </div>
      <div
        style={{
          fontSize: 24,
          color: "#a7f3d0",
          marginTop: 8,
          lineHeight: 1.4,
        }}
      >
        Email: ced.bhutan@gmail.com
      </div>
    </div>,
    size,
  );
}
