import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "JSON to Java Class Converter - Free Online Tool",
  description:
    "Convert JSON to Java classes online for free. Paste or upload JSON, generate Java POJOs with fields, getters, setters, lists, and nested classes.",
  keywords: [
    "json to java",
    "json to java class",
    "json to pojo converter",
    "json to java pojo",
    "java class generator",
    "generate java class from json",
    "json to jackson class",
    "online JSON converter",
    "JSON to Java free tool",
  ],
  alternates: { canonical: "/json-to-java" },
  openGraph: {
    title: "JSON to Java Class Converter - Free Online Tool",
    description:
      "Convert JSON to Java classes online for free. Paste or upload JSON, generate Java POJOs with fields, getters, setters, lists, and nested classes.",
    url: "/json-to-java",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} online JSON to Java class converter`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON to Java Class Converter - Free Online Tool",
    description:
      "Convert JSON to Java classes online for free. Paste or upload JSON, generate Java POJOs with fields, getters, setters, lists, and nested classes.",
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online JSON to Java class converter`,
      },
    ],
  },
};

export default function JsonToJavaLayout({ children }) {
  return <section>{children}</section>;
}
