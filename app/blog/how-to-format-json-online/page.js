import Link from "next/link";
import { SITE_NAME, SITE_URL } from "../../seo";
import styles from "./page.module.css";

const ARTICLE_PATH = "/blog/how-to-format-json-online";
const ARTICLE_TITLE = "How to Format JSON Online";
const ARTICLE_DESCRIPTION =
  "Learn how to format JSON online, make nested data easier to read, validate syntax, and troubleshoot common formatting errors.";
const ARTICLE_URL = `${SITE_URL}${ARTICLE_PATH}`;
const PUBLISHED_DATE = "2026-08-20";

function JsonExample({ children }) {
  return <pre className={styles.code}>{children}</pre>;
}

export const metadata = {
  title: ARTICLE_TITLE,
  description: ARTICLE_DESCRIPTION,
  keywords: [
    "format JSON online",
    "JSON formatter online",
    "beautify JSON",
    "pretty print JSON",
    "JSON formatting guide",
  ],
  alternates: { canonical: ARTICLE_PATH },
  openGraph: {
    title: ARTICLE_TITLE,
    description: ARTICLE_DESCRIPTION,
    url: ARTICLE_PATH,
    siteName: SITE_NAME,
    type: "article",
    publishedTime: PUBLISHED_DATE,
    authors: [SITE_NAME],
  },
  twitter: {
    card: "summary_large_image",
    title: ARTICLE_TITLE,
    description: ARTICLE_DESCRIPTION,
  },
};

export default function HowToFormatJsonOnlinePage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: ARTICLE_TITLE,
    description: ARTICLE_DESCRIPTION,
    url: ARTICLE_URL,
    datePublished: PUBLISHED_DATE,
    dateModified: PUBLISHED_DATE,
    author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    mainEntityOfPage: { "@type": "WebPage", "@id": ARTICLE_URL },
  };
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: ARTICLE_TITLE, item: ARTICLE_URL },
    ],
  };

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([structuredData, breadcrumbData]).replace(
            /</g,
            "\\u003c",
          ),
        }}
      />

      <nav className={styles.nav} aria-label="Breadcrumb">
        <Link href="/">JSON Beautifier</Link>
        <span aria-hidden="true">/</span>
        <Link href="/blog">Blog</Link>
        <span aria-hidden="true">/</span>
        <span>How to Format JSON Online</span>
      </nav>

      <article className={styles.article}>
        <header>
          <p className={styles.eyebrow}>JSON formatting</p>
          <h1>{ARTICLE_TITLE}</h1>
          <p className={styles.meta}>Published August 20, 2026</p>
          <p className={styles.lede}>{ARTICLE_DESCRIPTION}</p>
        </header>

        <section>
          <h2>What does it mean to format JSON?</h2>
          <p>
            Formatting JSON, also called beautifying or pretty-printing JSON,
            adds indentation and line breaks to a compact data string. The
            information does not change; the layout simply makes objects,
            arrays, and nested values easier to inspect.
          </p>
          <p>
            This is especially useful when you receive a minified API response,
            open a configuration file, or need to understand a large payload
            before editing it.
          </p>
        </section>

        <section>
          <h2>Format JSON online in three steps</h2>
          <ol>
            <li>Copy the JSON from your API response, file, or application.</li>
            <li>Paste it into the editor on the <Link href="/">JSON Beautifier</Link>.</li>
            <li>Review the indented output and fix any syntax errors reported by the editor.</li>
          </ol>
          <p>
            A formatter parses the input before displaying the result. That
            means it can identify invalid syntax instead of quietly changing
            your data into something that only looks correct.
          </p>
        </section>

        <section>
          <h2>Before and after formatting</h2>
          <p>
            Compact JSON is efficient for transmission but hard to scan. For
            example, this one-line object contains several nested values:
          </p>
          <JsonExample>{`{"user":{"name":"Ada","roles":["admin","editor"],"active":true}}`}</JsonExample>
          <p>After formatting, the same data is much easier to read:</p>
          <JsonExample>{`{
  "user": {
    "name": "Ada",
    "roles": [
      "admin",
      "editor"
    ],
    "active": true
  }
}`}</JsonExample>
          <p>
            Notice that the keys and values are unchanged. Only whitespace was
            added around the structure.
          </p>
        </section>

        <section>
          <h2>How to tell if JSON is valid</h2>
          <p>
            Formatting and validation work together. Valid JSON follows a few
            strict rules:
          </p>
          <ul>
            <li>Property names and text values use double quotes.</li>
            <li>Objects use curly braces and arrays use square brackets.</li>
            <li>Items are separated with commas, but the final item has no trailing comma.</li>
            <li>Values must be valid strings, numbers, booleans, null, objects, or arrays.</li>
          </ul>
          <p>
            If formatting fails, check the character near the reported error.
            A missing comma, an extra comma, or an unmatched bracket is often
            enough to make the complete document invalid.
          </p>
        </section>

        <section>
          <h2>When to minify JSON instead</h2>
          <p>
            Use formatted JSON while debugging, reviewing, or documenting data.
            Use minified JSON when reducing the size of a request or response
            matters more than readability. The <Link href="/json-minify">JSON minifier</Link>
            removes unnecessary whitespace while preserving the data itself.
          </p>
        </section>

        <section>
          <h2>Keep your formatted JSON useful</h2>
          <p>
            Formatting is a viewing and editing aid, not a substitute for a
            schema or careful testing. Once the structure is clear, confirm that
            required fields have the expected types and that sensitive values
            are not being shared unnecessarily.
          </p>
          <p>
            For a quick browser-based workflow, paste your document into the
            <Link href="/"> online JSON formatter</Link>, inspect the result,
            and then copy the readable version back into your editor or notes.
          </p>
        </section>

        <footer className={styles.articleFooter}>
          <Link href="/blog">Back to JSON guides</Link>
          <Link href="/blog/what-is-json">Read the JSON basics guide</Link>
        </footer>
      </article>
    </main>
  );
}
