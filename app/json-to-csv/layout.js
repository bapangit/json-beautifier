import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "JSON to CSV Converter - Free Online Tool",
  description:
    "Convert JSON to CSV online for free. Paste JSON, transform it into CSV, and copy or download the result in seconds.",
  keywords: [
    "json to csv converter",
    "convert json to csv",
    "json csv converter online",
    "json to csv online",
    "json to csv tool",
    "json to csv formatter",
    "online JSON converter",
    "JSON to CSV free tool",
  ],
  alternates: { canonical: "/json-to-csv" },
  openGraph: {
    title: "JSON to CSV Converter - Free Online Tool",
    description:
      "Convert JSON to CSV online for free. Paste JSON, transform it into CSV, and copy or download the result instantly.",
    url: "/json-to-csv",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to CSV Converter - Free Online Tool",
    description:
      "Convert JSON to CSV online for free. Paste JSON, transform it into CSV, and copy or download the result instantly.",
    images: [{ url: TWITTER_IMAGE, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
};

export default function JsonToCsvLayout({ children }) {
  return <section>{children}</section>;
}