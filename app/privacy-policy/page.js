import Link from "next/link";
import {
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
  TWITTER_IMAGE,
} from "../seo";
import styles from "./page.module.css";

const PRIVACY_PATH = "/privacy-policy";
const PRIVACY_TITLE = "Privacy Policy | JSON Beautifier";
const PRIVACY_DESCRIPTION =
  "Read the JSON Beautifier privacy policy, including how the online JSON formatter handles editor data, browser storage, and contact messages.";
const PRIVACY_URL = `${SITE_URL}${PRIVACY_PATH}`;
const CONTACT_EMAIL = "cmandal97531@gmail.com";

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Privacy Policy",
  description: PRIVACY_DESCRIPTION,
  url: PRIVACY_URL,
  isPartOf: {
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  },
  about: {
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
  },
};

/** @type {import("next").Metadata} */
export const metadata = {
  title: PRIVACY_TITLE,
  description: PRIVACY_DESCRIPTION,
  alternates: {
    canonical: PRIVACY_PATH,
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
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    url: PRIVACY_PATH,
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
    title: PRIVACY_TITLE,
    description: PRIVACY_DESCRIPTION,
    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online JSON formatter and viewer`,
      },
    ],
  },
};

export default function PrivacyPolicyPage() {
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=JSON%20Beautifier%20Privacy%20Question`;

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
        <span>Privacy Policy</span>
      </nav>

      <article className={styles.content}>
        <h1>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: August 13, 2026</p>

        <p>
          JSON Beautifier is an online formatter and viewer for JSON data. This
          policy explains what information may be handled when you use the
          website and how you can contact us with privacy questions.
        </p>

        <section>
          <h2>JSON Editor Data</h2>
          <p>
            JSON you paste into the editor is processed in your browser for
            formatting, viewing, searching, copying, and downloading. The
            formatter is not designed to send your pasted JSON to our servers
            for formatting.
          </p>
          <p>
            Avoid pasting passwords, access tokens, private keys, medical data,
            financial data, or other sensitive personal information into the
            editor.
          </p>
        </section>

        <section>
          <h2>Browser Storage</h2>
          <p>
            The tool may use browser storage, such as local storage, to remember
            editor settings, saved snippets, view preferences, and recent
            content on your device. This helps the tool keep working between
            visits.
          </p>
          <p>
            You can remove this stored data by clearing site data for JSON
            Beautifier in your browser.
          </p>
        </section>

        <section>
          <h2>Information We May Receive</h2>
          <p>
            If you contact us by email, we receive your email address and the
            content of your message. Hosting, security, and browser systems may
            also process standard technical information such as IP address,
            browser type, pages requested, and timestamps.
          </p>
        </section>

        <section>
          <h2>How Information Is Used</h2>
          <ul>
            <li>To operate, maintain, and improve JSON Beautifier.</li>
            <li>To respond to feedback, support requests, or privacy questions.</li>
            <li>To protect the website from abuse, errors, and security issues.</li>
          </ul>
        </section>

        <section>
          <h2>Sharing</h2>
          <p>
            We do not sell personal information. We may share information with
            service providers that help operate the website, when required by
            law, or when necessary to protect the site and its users.
          </p>
        </section>

        <section>
          <h2>Do Not Track And Third-Party Collection</h2>
          <p>
            Some browsers offer Do Not Track or similar privacy signals. Because
            there is no single accepted standard for these signals, the website
            does not currently change its behavior in response to them.
          </p>
          <p>
            Third-party services that support hosting, security, analytics, ads,
            or other site operations may process technical information according
            to their own privacy practices.
          </p>
        </section>

        <section>
          <h2>Cookies And Similar Technologies</h2>
          <p>
            The website may use cookies or similar browser technologies for
            functionality, preferences, security, or measurement. You can manage
            cookies and site storage through your browser settings.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>
            JSON Beautifier is not directed to children under 13, and we do not
            knowingly collect personal information from children under 13.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <ul>
            <li>Do not paste sensitive information into the editor.</li>
            <li>Clear browser storage to remove saved local data.</li>
            <li>Use browser controls to manage cookies and site permissions.</li>
            <li>Contact us with privacy questions or requests.</li>
          </ul>
        </section>

        <section>
          <h2>Access And Deletion Requests</h2>
          <p>
            The editor does not require an account. For information stored in
            your browser, you can clear site data locally. For email messages
            you sent to us, contact us if you want to request access,
            correction, or deletion.
          </p>
        </section>

        <section>
          <h2>Changes To This Policy</h2>
          <p>
            We may update this policy when the website changes or when privacy
            practices need to be clarified. The updated date at the top of this
            page shows when the policy was last revised.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For privacy questions, email{" "}
            <a href={mailtoHref}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
