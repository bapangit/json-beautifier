import Link from "next/link";
import { SITE_NAME, SITE_URL } from "../../seo";
import styles from "./page.module.css";

const ARTICLE_PATH = "/blog/what-is-json";
const ARTICLE_TITLE = "What Is JSON? A Beginner's Guide";
const ARTICLE_DESCRIPTION =
  "Learn what JSON is, how JSON objects and arrays work, common JSON data types, and how to format and validate JSON online.";
const ARTICLE_URL = `${SITE_URL}${ARTICLE_PATH}`;
const PUBLISHED_DATE = "2026-08-19";

export const metadata = {
  title: ARTICLE_TITLE,
  description: ARTICLE_DESCRIPTION,
  keywords: [
    "what is JSON",
    "JSON explained",
    "JSON beginner guide",
    "JSON syntax",
    "JSON objects and arrays",
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

export default function WhatIsJsonPage() {
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
        <span>What Is JSON?</span>
      </nav>

      <article className={styles.article}>
        <header>
          <p className={styles.eyebrow}>JSON basics</p>
          <h1>{ARTICLE_TITLE}</h1>
          <p className={styles.meta}>Published August 19, 2026</p>
          <p className={styles.lede}>{ARTICLE_DESCRIPTION}</p>
        </header>

        <section>
          <h2>What is JSON?</h2>
          <p>
            JSON, short for JavaScript Object Notation, is a lightweight text
            format for storing and exchanging structured data. It is easy for
            people to read and easy for software to parse, which makes it common
            in web APIs, configuration files, and data exports.
          </p>
          <p>
            Although JSON originated from JavaScript syntax, it is language
            independent. Applications written in Java, Python, PHP, Go, and
            many other languages can read and create JSON.
          </p>
        </section>

        <section>
          <h2>A simple JSON example</h2>
          <p>Here is a JSON object describing a book:</p>
          <JsonExample>{`{
  "title": "The Little Prince",
  "author": "Antoine de Saint-Exupery",
  "year": 1943,
  "available": true
}`}</JsonExample>
          <p>
            The data is organized as key-value pairs. The key is written in
            double quotes, followed by a colon and its value.
          </p>
        </section>

        <section>
          <h2>JSON data types</h2>
          <p>JSON supports six basic value types:</p>
          <ul>
            <li><strong>String:</strong> text inside double quotes.</li>
            <li><strong>Number:</strong> an integer or decimal value.</li>
            <li><strong>Boolean:</strong> either true or false.</li>
            <li><strong>Null:</strong> an intentional empty value.</li>
            <li><strong>Object:</strong> a collection of key-value pairs.</li>
            <li><strong>Array:</strong> an ordered list of values.</li>
          </ul>
        </section>

        <section>
          <h2>JSON objects and arrays</h2>
          <p>
            An object starts with an opening brace and ends with a closing brace.
            It stores named properties, such as a user profile or product.
            Arrays use square brackets and store an ordered list of values.
          </p>
          <JsonExample>{`{
  "name": "Ada",
  "skills": ["Python", "SQL", "JavaScript"]
}`}</JsonExample>
          <p>
            Objects and arrays can be nested, allowing JSON to represent both
            simple settings and deeply structured API responses.
          </p>
        </section>

        <section>
          <h2>Where is JSON used?</h2>
          <p>Common uses for JSON include:</p>
          <ul>
            <li>Sending data between a browser and a web server.</li>
            <li>Representing REST API requests and responses.</li>
            <li>Storing application settings and configuration.</li>
            <li>Exporting structured data between tools.</li>
          </ul>
        </section>

        <section>
          <h2>How to format and validate JSON</h2>
          <p>
            Valid JSON must use double quotes around property names and strings,
            separate items with commas, and close every object and array. A
            missing comma or bracket can make an entire document invalid.
          </p>
          <p>
            Paste your data into the{" "}
            <Link href="/">JSON Beautifier online formatter</Link> to make
            nested content easier to read and catch syntax errors quickly. You
            can also use the <Link href="/json-minify">JSON minifier</Link> when
            you need a compact version.
          </p>
        </section>

        <section>
          <h2>Summary</h2>
          <p>
            JSON is a compact, portable way to represent structured data. Once
            you understand objects, arrays, and the basic value types, you can
            read most JSON files and work confidently with APIs and data tools.
          </p>
        </section>

        <footer className={styles.articleFooter}>
          <Link href="/blog">Back to JSON guides</Link>
          <Link href="/json-to-xml">Explore JSON conversion tools</Link>
        </footer>
      </article>
    </main>
  );
}
