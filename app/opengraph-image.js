import { ImageResponse } from "next/og";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./seo";

export const alt = `${SITE_NAME} online JSON formatter and viewer`;

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function Image() {
  const logoUrl = `${SITE_URL}/logo512.png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#111827",
          color: "#f9fafb",
          padding: "78px",
          fontFamily: "Arial",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            marginBottom: "30px",
          }}
        >
          <img
            src={logoUrl}
            width="110"
            height="110"
            style={{
              objectFit: "contain",
            }}
          />
        </div>

        {/* Site Name */}
        <div
          style={{
            display: "flex",
            fontSize: 78,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          {SITE_NAME}
        </div>

        {/* Description */}
        <div
          style={{
            display: "flex",
            width: "860px",
            marginTop: "28px",
            fontSize: 34,
            lineHeight: 1.3,
            color: "#d1d5db",
          }}
        >
          {SITE_DESCRIPTION}
        </div>

        {/* Tagline */}
        <div
          style={{
            display: "flex",
            marginTop: "46px",
            fontSize: 26,
            color: "#93c5fd",
          }}
        >
          Beautify JSON. Validate JSON. Inspect JSON.
        </div>
      </div>
    ),
    size,
  );
}