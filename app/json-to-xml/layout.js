import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "JSON to XML Converter - Free Online Tool",
  description:
    "Convert JSON to XML online for free. Paste JSON, transform it to XML, validate structure, and copy or download the result in seconds.",
  keywords: [
    "json to xml converter",
    "convert json to xml",
    "json xml converter online",
    "json to xml online",
    "json to xml tool",
    "json to xml formatter",
    "online JSON converter",
    "JSON to XML free tool",
  ],
  alternates: { canonical: "/json-to-xml" },
  openGraph: {
    title: "JSON to XML Converter - Free Online Tool",
    description:
      "Convert JSON to XML online for free. Paste JSON, transform it to XML, and copy or download the result instantly.",
    url: "/json-to-xml",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to XML Converter - Free Online Tool",
    description:
      "Convert JSON to XML online for free. Paste JSON, transform it to XML, and copy or download the result instantly.",
    images: [{ url: TWITTER_IMAGE, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
};

export default function JsonToXmlLayout({ children }) {
  return <section>{children}</section>;
}