import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "JSON Minifier - Free Online Tool",
  description:
    "Minify JSON online for free. Paste readable JSON, compress it into a compact format, validate its structure, and copy or download the result.",
  keywords: [
    "json minifier",
    "minify json online",
    "json compressor",
    "compress json",
    "json minifier online",
    "json formatter and minifier",
    "online JSON tool",
    "JSON minifier free tool",
  ],
  alternates: { canonical: "/json-minify" },
  openGraph: {
    title: "JSON Minifier - Free Online Tool",
    description:
      "Minify JSON online for free. Paste readable JSON, compress it into a compact format, and copy or download the result instantly.",
    url: "/json-minify",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Minifier - Free Online Tool",
    description:
      "Minify JSON online for free. Paste readable JSON, compress it into a compact format, and copy or download the result instantly.",
    images: [{ url: TWITTER_IMAGE, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
};

export default function JsonMinifyLayout({ children }) {
  return <section>{children}</section>;
}