import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "JSON Difference Checker - Free Online Tool",
  description:
    "Compare two JSON documents online for free. Paste or upload JSON, validate both sides, highlight differences, and copy or download the results.",
  keywords: [
    "json diff checker",
    "json difference checker",
    "compare json online",
    "json compare tool",
    "json diff tool",
    "compare json files",
    "online JSON tool",
    "JSON diff free tool",
  ],
  alternates: { canonical: "/json-diff-checker" },
  openGraph: {
    title: "JSON Difference Checker - Free Online Tool",
    description:
      "Compare two JSON documents online for free. Paste or upload JSON, validate both sides, highlight differences, and copy or download the results.",
    url: "/json-diff-checker",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} online JSON difference checker`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Difference Checker - Free Online Tool",
    description:
      "Compare two JSON documents online for free. Paste or upload JSON, validate both sides, highlight differences, and copy or download the results.",
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online JSON difference checker`,
      },
    ],
  },
};

export default function JsonDiffCheckerLayout({ children }) {
  return <section>{children}</section>;
}
