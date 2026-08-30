import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "GZip Compressor - Free Online Tool",

  description:
    "Compress text and data with GZip online for free. Paste or upload your content, compress it instantly, and view or download the GZip-compressed result.",

  keywords: [
    "gzip compressor",
    "gzip compressor online",
    "gzip compress online",
    "compress gzip",
    "gzip compression",
    "gzip encoder",
    "gzip file compressor",
    "online gzip tool",
    "gzip data compressor",
    "compress data with gzip",
  ],

  alternates: {
    canonical: "/gzip-compress",
  },

  openGraph: {
    title: "GZip Compressor - Free Online Tool",

    description:
      "Compress text and data with GZip online for free. Paste or upload your content, compress it instantly, and view or download the GZip-compressed result.",

    url: "/gzip-compress",

    siteName: SITE_NAME,

    type: "website",

    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} online GZip compression tool`,
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "GZip Compressor - Free Online Tool",

    description:
      "Compress text and data with GZip online for free. Compress your content instantly and view or download the GZip-compressed result.",

    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online GZip compression tool`,
      },
    ],
  },
};

export default function GzipCompressLayout({ children }) {
  return <section>{children}</section>;
}