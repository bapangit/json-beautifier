import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "XML to JSON Converter - Free Online Tool",
  description:
    "Convert XML to JSON online for free. Paste XML, transform it to readable JSON, validate the structure, and copy or download the result instantly.",
  keywords: [
    "xml to json converter",
    "convert xml to json",
    "xml json converter online",
    "xml to json online",
    "xml to json tool",
    "xml parser online",
    "online XML converter",
    "XML to JSON free tool",
  ],
  alternates: { canonical: "/xml-to-json" },
  openGraph: {
    title: "XML to JSON Converter - Free Online Tool",
    description:
      "Convert XML to JSON online for free. Paste XML, transform it to readable JSON, validate the structure, and copy or download the result instantly.",
    url: "/xml-to-json",
    siteName: SITE_NAME,
    type: "website",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "XML to JSON Converter - Free Online Tool",
    description:
      "Convert XML to JSON online for free. Paste XML, transform it to readable JSON, validate the structure, and copy or download the result instantly.",
    images: [{ url: TWITTER_IMAGE, alt: `${SITE_NAME} online JSON formatter and viewer` }],
  },
};

export default function XmlToJsonLayout({ children }) {
  return <section>{children}</section>;
}