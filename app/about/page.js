import Link from "next/link";
import {
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TWITTER_IMAGE,
} from "../seo";
import styles from "./page.module.css";

const ABOUT_PATH = "/about";
const ABOUT_TITLE = "About JSON Beautifier | Online JSON Formatter";
const ABOUT_DESCRIPTION =
  "Learn what JSON Beautifier does, who it is for, and how it keeps JSON formatting simple and private.";
const ABOUT_URL = `${SITE_URL}${ABOUT_PATH}`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "About JSON Beautifier",
  description: ABOUT_DESCRIPTION,
  url: ABOUT_URL,
};

/** @type {import("next").Metadata} */
export const metadata = {
  title: ABOUT_TITLE,
  description: ABOUT_DESCRIPTION,
  alternates: {
    canonical: ABOUT_PATH,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    url: ABOUT_PATH,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} online JSON formatter and viewer`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: ABOUT_TITLE,
    description: ABOUT_DESCRIPTION,
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online JSON formatter and viewer`,
      },
    ],
  },
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />

      <nav className={styles.nav} aria-label="Breadcrumb">
        <Link href="/">JSON Beautifier</Link>
        <span aria-hidden="true">/</span>
        <span>About</span>
      </nav>

      <article className={styles.content}>
        <h1>About</h1>
        <p>
          Welcome to our JSON Pretty Viewer and Formatter website. We provide a
          simple tool to make JSON data more readable and organized for
          developers, analysts, and anyone working with structured data.
        </p>
        <p>
          The editor is designed to turn nested JSON into a clean, readable
          format in a few clicks. It helps you inspect payloads faster, validate
          structure visually, and work with JSON without installing extra tools.
        </p>
        <p>
          We prioritize privacy. JSON pasted into the editor is handled in the
          browser, and we do not intend this page to be used for storing private
          user data on our servers.
        </p>
        <p>
          We continue improving the formatter based on practical developer
          workflows and feedback.
        </p>
      </article>
    </main>
  );
}
