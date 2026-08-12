import Link from "next/link";
import {
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TWITTER_IMAGE,
} from "../seo";
import styles from "./page.module.css";

const CONTACT_PATH = "/contact";
const CONTACT_EMAIL = "contact@jsonprettyview.org";
const CONTACT_TITLE = "Contact JSON Beautifier | Support & Feedback";
const CONTACT_DESCRIPTION =
  "Contact JSON Beautifier for feedback, bug reports, feature requests, and questions about the online JSON formatter.";
const CONTACT_URL = `${SITE_URL}${CONTACT_PATH}`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact JSON Beautifier",
  description: CONTACT_DESCRIPTION,
  url: CONTACT_URL,
  mainEntity: {
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    email: CONTACT_EMAIL,
  },
};

/** @type {import("next").Metadata} */
export const metadata = {
  title: CONTACT_TITLE,
  description: CONTACT_DESCRIPTION,
  alternates: {
    canonical: CONTACT_PATH,
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
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    url: CONTACT_PATH,
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
    title: CONTACT_TITLE,
    description: CONTACT_DESCRIPTION,
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online JSON formatter and viewer`,
      },
    ],
  },
};

export default function ContactPage() {
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=JSON%20Beautifier%20Feedback`;

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
        <span>Contact</span>
      </nav>

      <article className={styles.content}>
        <h1>Contact Us</h1>
        <p>
          Have feedback, found a bug, or want to suggest an improvement for the
          JSON formatter? Send a note and include any details that would help us
          understand the issue.
        </p>

        <section className={styles.contactBlock} aria-labelledby="email-title">
          <h2 id="email-title">Email</h2>
          <p>
            Reach the JSON Beautifier team at{" "}
            <a href={mailtoHref}>{CONTACT_EMAIL}</a>.
          </p>
        </section>

        <section className={styles.guidance} aria-labelledby="helpful-details">
          <h2 id="helpful-details">Helpful Details</h2>
          <ul>
            <li>For bugs, include your browser and what you expected to happen.</li>
            <li>For formatting issues, share a small non-sensitive JSON sample.</li>
            <li>For feature ideas, describe the workflow you want to improve.</li>
          </ul>
        </section>
      </article>
    </main>
  );
}
