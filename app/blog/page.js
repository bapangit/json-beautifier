import Link from "next/link";
import { SITE_NAME, SITE_URL } from "../seo";
import styles from "./page.module.css";

const BLOG_PATH = "/blog";
const BLOG_TITLE = "JSON Guides and Tutorials | JSON Beautifier";
const BLOG_DESCRIPTION =
  "Practical JSON guides and tutorials covering formatting, validation, syntax, and data conversion.";

export const metadata = {
  title: BLOG_TITLE,
  description: BLOG_DESCRIPTION,
  alternates: { canonical: BLOG_PATH },
  openGraph: {
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
    url: BLOG_PATH,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: BLOG_TITLE,
    description: BLOG_DESCRIPTION,
  },
};

const articles = [
  {
    href: "/blog/json-errors",
    title: "Common JSON Errors and How to Fix Them",
    description:
      "Find and fix common json errors, including missing commas, quote problems, trailing commas, and mismatched brackets.",
    label: "JSON troubleshooting",
  },
  {
    href: "/blog/how-to-format-json-online",
    title: "How to Format JSON Online",
    description:
      "Turn compact or difficult-to-read JSON into clean, indented data and learn how to spot formatting errors quickly.",
    label: "JSON formatting",
  },
  {
    href: "/blog/what-is-json",
    title: "What Is JSON? A Beginner's Guide",
    description:
      "Learn what JSON is, how JSON objects and arrays work, and where this lightweight data format is used.",
    label: "JSON basics",
  },
  {
    href: "/blog/json-vs-xml",
    title: "JSON vs XML: What Is the Difference?",
    description:
      "Compare JSON and XML syntax, readability, file size, data types, and common use cases.",
    label: "Data formats",
  },
];

export default function BlogPage() {
  const blogUrl = `${SITE_URL}${BLOG_PATH}`;

  return (
    <main className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: BLOG_TITLE,
            description: BLOG_DESCRIPTION,
            url: blogUrl,
            isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
          }).replace(/</g, "\\u003c"),
        }}
      />

      <nav className={styles.nav} aria-label="Breadcrumb">
        <Link href="/">JSON Beautifier</Link>
        <span aria-hidden="true">/</span>
        <span>Blog</span>
      </nav>

      <section className={styles.content}>
        <p className={styles.eyebrow}>JSON guides</p>
        <h1>Learn JSON with practical guides</h1>
        <p className={styles.intro}>
          Clear explanations for developers, students, and anyone who works with
          structured data.
        </p>

        <div className={styles.articleList}>
          {articles.map((article) => (
            <article className={styles.articleCard} key={article.href}>
              <p className={styles.label}>{article.label}</p>
              <h2>
                <Link href={article.href}>{article.title}</Link>
              </h2>
              <p>{article.description}</p>
              <Link className={styles.readMore} href={article.href}>
                Read guide <span aria-hidden="true">-&gt;</span>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
