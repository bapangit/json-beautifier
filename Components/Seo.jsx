import Head from "next/head";
import {
  OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "../app/seo";

const DEFAULT_IMAGE = `${SITE_URL}${OG_IMAGE}`;

function Seo({
  title,
  description,
  path = "/",
  keywords,
  type = "website",
  noindex = false,

  // Optional page-specific values
  image = DEFAULT_IMAGE,
  imageAlt = `${SITE_NAME} logo`,
  author = SITE_NAME,
  locale = "en_US",

  // Article-specific
  publishedTime,
  modifiedTime,

  // JSON-LD
  structuredData,
}) {
  // Make sure the canonical URL doesn't contain accidental double slashes.
  const normalizedSiteUrl = SITE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const canonicalUrl =
    normalizedPath === "/"
      ? normalizedSiteUrl
      : `${normalizedSiteUrl}${normalizedPath}`;

  const robots = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  const structuredDataItems = Array.isArray(structuredData)
    ? structuredData
    : structuredData
    ? [structuredData]
    : [];

  /*
   * Prevent </script> from appearing inside JSON-LD.
   * This avoids prematurely closing the script element.
   */
  const serializeJsonLd = (data) =>
    JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <Head>
      {/* Basic SEO */}
      <title>{title}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="robots"
        content={robots}
      />

      <meta
        name="author"
        content={author}
      />

      {keywords ? (
        <meta
          name="keywords"
          content={keywords}
        />
      ) : null}

      {/* Canonical */}
      <link
        rel="canonical"
        href={canonicalUrl}
      />

      {/* Language */}
      <meta
        httpEquiv="content-language"
        content="en"
      />

      {/* Theme */}
      <meta
        name="theme-color"
        content="#ffffff"
      />

      {/* =========================
          Open Graph
          ========================= */}

      <meta
        property="og:site_name"
        content={SITE_NAME}
      />

      <meta
        property="og:type"
        content={type}
      />

      <meta
        property="og:locale"
        content={locale}
      />

      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      <meta
        property="og:image"
        content={image}
      />

      <meta
        property="og:image:alt"
        content={imageAlt}
      />

      <meta
        property="og:image:width"
        content="1200"
      />

      <meta
        property="og:image:height"
        content="630"
      />

      <meta
        property="og:image:type"
        content="image/png"
      />

      {/* =========================
          Article metadata
          ========================= */}

      {type === "article" && publishedTime ? (
        <meta
          property="article:published_time"
          content={publishedTime}
        />
      ) : null}

      {type === "article" && modifiedTime ? (
        <meta
          property="article:modified_time"
          content={modifiedTime}
        />
      ) : null}

      {type === "article" && author ? (
        <meta
          property="article:author"
          content={author}
        />
      ) : null}

      {/* =========================
          Twitter
          ========================= */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={image}
      />

      <meta
        name="twitter:image:alt"
        content={imageAlt}
      />

      {/* =========================
          Structured Data
          ========================= */}

      {structuredDataItems.map((item, index) => (
        <script
          key={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(item),
          }}
        />
      ))}
    </Head>
  );
}

export { SITE_NAME, SITE_URL };

export default Seo;