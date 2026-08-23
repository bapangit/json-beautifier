import Link from "next/link";
import { SITE_NAME, SITE_URL } from "../../seo";
import styles from "./page.module.css";

const ARTICLE_PATH = "/blog/json-errors";
const ARTICLE_TITLE = "Common JSON Errors and How to Fix Them";
const ARTICLE_DESCRIPTION =
  "Learn how to find and fix common JSON errors, including missing commas, quote problems, trailing commas, and mismatched brackets.";
const ARTICLE_URL = `${SITE_URL}${ARTICLE_PATH}`;
const PUBLISHED_DATE = "2026-08-23";

export const metadata = {
  title: ARTICLE_TITLE,
  description: ARTICLE_DESCRIPTION,
  keywords: [
    "json errors",
    "common JSON errors",
    "fix JSON errors",
    "JSON syntax errors",
    "JSON validation",
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

function JsonExample({ children }) {
  return <pre className={styles.code}>{children}</pre>;
}

export default function JsonErrorsPage() {
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
        <span>JSON errors</span>
      </nav>

      <article className={styles.article}>
        <header>
          <p className={styles.eyebrow}>JSON troubleshooting</p>
          <h1>{ARTICLE_TITLE}</h1>
          <p className={styles.meta}>Published August 23, 2026</p>
          <p className={styles.lede}>{ARTICLE_DESCRIPTION}</p>
        </header>

        <section>
          <h2>Why JSON errors happen</h2>
          <p>
            JSON is strict by design. A single missing quote, comma, or closing
            bracket can make the entire document invalid. When an API response
            or configuration file fails to parse, start with the line and
            character reported by your validator, then inspect the nearby
            punctuation.
          </p>
          <p>
            Paste a non-sensitive sample into the <Link href="/">JSON Beautifier</Link>
            to format valid data and make its structure easier to inspect.
          </p>
        </section>

        <section>
          <h2>1. Missing or extra commas</h2>
          <p>
            Object properties and array items need commas between them. The last
            item does not need one. A missing comma often produces an error on
            the next property, which can make the message seem misleading.
          </p>
          <JsonExample>{`{\n  "name": "Ada"\n  "role": "editor"\n}`}</JsonExample>
          <p>Add a comma after the first property:</p>
          <JsonExample>{`{\n  "name": "Ada",\n  "role": "editor"\n}`}</JsonExample>
        </section>

        <section>
          <h2>2. Single quotes instead of double quotes</h2>
          <p>
            Standard JSON requires double quotes around property names and text
            values. Single quotes may work in JavaScript source, but they are
            not valid JSON syntax.
          </p>
          <JsonExample>{`{'name': 'Ada'}`}</JsonExample>
          <p>Replace both kinds of quotes with double quotes:</p>
          <JsonExample>{`{"name": "Ada"}`}</JsonExample>
        </section>

        <section>
          <h2>3. Trailing commas</h2>
          <p>
            JSON does not allow a comma after the final property or array item.
            Remove it before the closing brace or bracket.
          </p>
          <JsonExample>{`{\n  "name": "Ada",\n}`}</JsonExample>
        </section>

        <section>
          <h2>4. Mismatched brackets and braces</h2>
          <p>
            Every opening brace, bracket, or quote must have a matching closing
            character. Check nested objects from the inside out and make sure
            objects use curly braces while arrays use square brackets.
          </p>
          <JsonExample>{`{\n  "roles": ["admin", "editor"\n}`}</JsonExample>
          <p>The array needs its closing bracket before the object closes:</p>
          <JsonExample>{`{\n  "roles": ["admin", "editor"]\n}`}</JsonExample>
        </section>

        <section>
          <h2>5. Invalid values and comments</h2>
          <p>
            JSON values are limited to strings, numbers, objects, arrays,
            <code>true</code>, <code>false</code>, and <code>null</code>. JSON
            also does not support comments, undefined, NaN, or unquoted words.
            Remove comments and convert JavaScript-only values before parsing.
          </p>
          <JsonExample>{`{\n  "enabled": True,\n  // temporary setting\n  "value": undefined\n}`}</JsonExample>
        </section>

        <section>
          <h2>A quick process for fixing JSON errors</h2>
          <ol>
            <li>Read the validator message and note its line and column.</li>
            <li>Inspect the punctuation immediately before and after that location.</li>
            <li>Check quotes, commas, brackets, and allowed value types.</li>
            <li>Format the corrected document and validate it again.</li>
          </ol>
          <p>
            Avoid making several unrelated edits at once. Fixing one syntax
            error at a time makes the next parser message much easier to trust.
          </p>
        </section>

        <footer className={styles.articleFooter}>
          <Link href="/">Format JSON online</Link>
          <Link href="/blog/how-to-format-json-online">Read the JSON formatting guide</Link>
          <Link href="/blog">Back to all guides</Link>
        </footer>
      </article>
    </main>
  );
}
