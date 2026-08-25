import Link from "next/link";
import { SITE_NAME, SITE_URL } from "../../seo";
import styles from "./page.module.css";

const ARTICLE_PATH = "/blog/how-to-format-json-javascript";
const ARTICLE_TITLE = "How to Format JSON in JavaScript";
const ARTICLE_DESCRIPTION =
  "Learn how to format JSON in JavaScript with JSON.stringify, JSON.parse, indentation options, and practical browser and Node.js examples.";
const ARTICLE_URL = `${SITE_URL}${ARTICLE_PATH}`;
const PUBLISHED_DATE = "2026-08-25";

function CodeExample({ children }) {
  return <pre className={styles.code}>{children}</pre>;
}

export const metadata = {
  title: ARTICLE_TITLE,
  description: ARTICLE_DESCRIPTION,
  keywords: [
    "format JSON in JavaScript",
    "JavaScript JSON formatting",
    "JSON.stringify pretty print",
    "JSON.stringify indentation",
    "JavaScript JSON formatter",
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

export default function HowToFormatJsonJavascriptPage() {
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
        <span>How to Format JSON in JavaScript</span>
      </nav>

      <article className={styles.article}>
        <header>
          <p className={styles.eyebrow}>JavaScript and JSON</p>
          <h1>{ARTICLE_TITLE}</h1>
          <p className={styles.meta}>Published August 25, 2026</p>
          <p className={styles.lede}>{ARTICLE_DESCRIPTION}</p>
        </header>

        <section>
          <h2>What does formatting JSON do?</h2>
          <p>
            Formatting JSON adds line breaks and indentation to a JSON string so
            that objects, arrays, and nested values are easier to read. It does
            not change the data. The standard JavaScript tools for this work are
            <code>JSON.parse()</code> and <code>JSON.stringify()</code>.
          </p>
          <p>
            utility. For a ready-made editor, try the{" "}
            <Link href="/">JSON Beautifier</Link>.
          </p>
        </section>

        <section>
          <h2>Format JSON in Node.js</h2>
          <p>
            Node.js uses the same built-in JSON methods. You can format an
            object before writing it to a file or printing it in a terminal.
          </p>
          <CodeExample>{`import { writeFile } from "node:fs/promises";

const settings = { port: 3000, debug: false };
const formattedJson = JSON.stringify(settings, null, 2);

await writeFile("settings.json", formattedJson + "\\n");`}</CodeExample>
          <p>
            Adding a final newline makes generated files easier to inspect in
            command-line tools and version control.
          </p>
        </section>

        <section>
          <h2>Important JavaScript values to remember</h2>
          <p>
            JSON is stricter than a JavaScript object literal. JSON does not
            support comments, functions, <code>undefined</code>, <code>NaN</code>,
            or single-quoted strings. When stringifying an object, properties
            with <code>undefined</code> values and functions are omitted, while
            <code>undefined</code> values inside arrays become <code>null</code>.
          </p>
          <p>
            Check the formatted output when these values matter. Formatting is
            not a lossless conversion for every JavaScript value.
          </p>
        </section>

        <section>
          <h2>Quick reference</h2>
          <ul>
            <li>Use <code>JSON.parse(text)</code> to turn valid JSON text into a JavaScript value.</li>
            <li>Use <code>JSON.stringify(value, null, 2)</code> for readable JSON.</li>
            <li>Wrap parsing in <code>try...catch</code> when input may be invalid.</li>
            <li>Use <code>textContent</code> for displaying JSON text in the browser.</li>
          </ul>
          <p>
            You can also paste JSON into the{" "}
            <Link href="/">online JSON formatter</Link> to inspect its structure
            without writing a custom script.
          </p>
        </section>

        <footer className={styles.articleFooter}>
          <Link href="/">Format JSON online</Link>
          <Link href="/blog/how-to-format-json-online">Read the online formatting guide</Link>
          <Link href="/blog">Back to JSON guides</Link>
        </footer>
      </article>
    </main>
  );
}
