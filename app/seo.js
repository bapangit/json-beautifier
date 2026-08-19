const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.json-beautifier.net";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");
export const SITE_NAME = "JSON Beautifier";
export const SITE_TITLE =
  "JSON Beautifier - Online JSON Formatter, Viewer & Validator";
export const SITE_DESCRIPTION =
  "Format, beautify, validate, and inspect JSON online with a fast split-view JSON editor and viewer.";
export const SITE_KEYWORDS = [
  "json beautifier",
  "json beautifier online",
  "json formatter",
  "json formatter online",
  "json pretty print",
  "json viewer",
  "json validator",
  "json parser",
  "format json online",
  "beautify json online",
  "pretty print json online",
  "online json editor",
];
export const OG_IMAGE = "/opengraph-image";
export const TWITTER_IMAGE = "/twitter-image";

export const HOME_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${SITE_URL}/#application`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Any",
      description: SITE_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What does JSON Beautifier do?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "JSON Beautifier formats raw JSON into readable, indented output and lets you inspect it in a split-view editor.",
          },
        },
        {
          "@type": "Question",
          name: "Can I validate JSON before using it in an API or app?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Invalid JSON fails to parse, which makes malformed payloads easier to catch before you use them elsewhere.",
          },
        },
        {
          "@type": "Question",
          name: "Is JSON Beautifier free to use?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. JSON Beautifier is a free online JSON formatter, beautifier, validator, and viewer.",
          },
        },
      ],
    },
  ],
};