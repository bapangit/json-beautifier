import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
  title: "Brotli Compressor - Free Online Tool",
  description:
    "Compress text and data with Brotli online for free. Enter or paste your content, compress it instantly, and copy or download the Brotli-compressed result.",
  keywords: [
    "brotli compressor",
    "brotli compress",
    "brotli compressor online",
    "compress brotli online",
    "brotli compression tool",
    "brotli encoder",
    "brotli encode online",
    "brotli compression online",
    "compress data with brotli",
    "brotli compressor free",
  ],
  alternates: {
    canonical: "/brotli-compressor",
  },
  openGraph: {
    title: "Brotli Compressor - Free Online Tool",
    description:
      "Compress text and data with Brotli online for free. Enter or paste your content, compress it instantly, and copy or download the Brotli-compressed result.",
    url: "/brotli-compressor",
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Brotli Compressor`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Brotli Compressor - Free Online Tool",
    description:
      "Compress text and data with Brotli online for free. Enter or paste your content, compress it instantly, and copy or download the Brotli-compressed result.",
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} Brotli Compressor`,
      },
    ],
  },
};

export default function BrotliCompressorLayout({ children }) {
  return <section>{children}</section>;
}