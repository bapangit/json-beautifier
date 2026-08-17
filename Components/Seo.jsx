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
  structuredData,
}) {
  const canonicalUrl = `${SITE_URL}${path}`;
  const robots = noindex ? "noindex, nofollow" : "index, follow";
  const structuredDataItems = Array.isArray(structuredData)
    ? structuredData
    : structuredData
    ? [structuredData]
    : [];

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={robots} />
      <meta name="author" content={SITE_NAME} />
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={DEFAULT_IMAGE} />
      <meta property="og:image:alt" content={`${SITE_NAME} logo`} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_IMAGE} />

      {structuredDataItems.map((item, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(item)}
        </script>
      ))}
    </Head>
  );
}

export { SITE_NAME, SITE_URL };
export default Seo;