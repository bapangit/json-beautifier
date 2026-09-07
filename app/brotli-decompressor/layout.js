import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "Brotli Decompressor - Free Online Tool",
  description:
    "Decompress Brotli files and data online for free. Upload or paste Brotli-compressed data, decompress it instantly, and view or download the original content.",
  keywords: [
    "brotli decompressor",
    "brotli decompress online",
    "decompress brotli",
    "brotli decoder",
    "brotli decompression",
    "brotli decompressor online",
    "brotli file decompressor",
    "online brotli tool",
    "brotli decoder online",
    "brotli compression tool",
  ],
  alternates: {
    canonical: "/brotli-decompressor",
  },
  openGraph: {
    title: "Brotli Decompressor - Free Online Tool",
    description:
      "Decompress Brotli files and data online for free. Decompress compressed Brotli data instantly and view or download the original content.",
    url: "/brotli-decompressor",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} online Brotli decompression tool`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brotli Decompressor - Free Online Tool",
    description:
      "Decompress Brotli files and data online for free. Decompress compressed Brotli data instantly and view or download the original content.",
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online Brotli decompression tool`,
      },
    ],
  },
};

export default function BrotliDecompressLayout({ children }) {
  return <section>{children}</section>;
}