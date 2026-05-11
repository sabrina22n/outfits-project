import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#111111",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#EDE8DF",
            letterSpacing: "-2px",
            lineHeight: 1,
          }}
        >
          TO
        </div>
        <div
          style={{
            fontSize: 18,
            color: "#9B9390",
            letterSpacing: "4px",
          }}
        >
          OUTFITS
        </div>
      </div>
    ),
    size
  );
}
