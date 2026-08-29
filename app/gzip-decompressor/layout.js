import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "GZip Decompressor - Free Online Tool",
  description:
    "Decompress GZip files and data online for free. Upload or paste GZip-compressed data, decompress it instantly, and view or download the original content.",
  keywords: [
    "gzip decompressor",
    "gzip decompress online",
    "decompress gzip",
    "gzip decoder",
    "gzip decompression",
    "gzip decompressor online",
    "gzip file decompressor",
    "online gzip tool",
  ],
  alternates: {
    canonical: "/gzip-decompress",
  },
  openGraph: {
    title: "GZip Decompressor - Free Online Tool",
    description:
      "Decompress GZip files and data online for free. Decompress compressed GZip data instantly and view or download the original content.",
    url: "/gzip-decompress",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} online GZip decompression tool`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GZip Decompressor - Free Online Tool",
    description:
      "Decompress GZip files and data online for free. Decompress compressed GZip data instantly and view or download the original content.",
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online GZip decompression tool`,
      },
    ],
  },
};

export default function GzipDecompressLayout({ children }) {
  return <section>{children}</section>;
}