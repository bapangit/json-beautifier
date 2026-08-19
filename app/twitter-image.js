import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { SITE_DESCRIPTION, SITE_NAME } from "./seo";

export const alt = `${SITE_NAME} online JSON formatter and viewer`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(new URL("../public/logo512.png", import.meta.url));
  const logoData = `data:image/png;base64,${logo.toString("base64")}`;

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
        <img
          src={logoData}
          alt=""
          style={{
            width: "128px",
            height: "128px",
            borderRadius: "28px",
            marginBottom: "32px",
          }}
        />
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
