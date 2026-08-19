import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#14110F",
          color: "#C6A875",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          fontFamily: "Georgia, serif",
        }}
      >
        M
      </div>
    ),
    size,
  );
}
