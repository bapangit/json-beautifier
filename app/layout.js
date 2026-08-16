import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import StyledComponentsRegistry from "./lib/registry";
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  TWITTER_IMAGE,
} from "./seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },

  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: SITE_KEYWORDS,

  authors: [
    {
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],

  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",

  alternates: {
    canonical: "/",
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
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
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,

    images: [
      {
        url: TWITTER_IMAGE,
        alt: `${SITE_NAME} online JSON formatter and viewer`,
      },
    ],
  },

  manifest: "/manifest.webmanifest",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  themeColor: [
    {
      media: "(prefers-color-scheme: light)",
      color: "#ffffff",
    },
    {
      media: "(prefers-color-scheme: dark)",
      color: "#252525",
    },
  ],

  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>

        {/* =====================================================
            Google Analytics - G-P7FC4V9CYJ
        ====================================================== */}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-P7FC4V9CYJ"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-P7FC4V9CYJ');
          `}
        </Script>

        {/* =====================================================
            Google Tag - G-F8X84Y931X
        ====================================================== */}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F8X84Y931X"
          strategy="afterInteractive"
        />

        <Script id="google-tag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-F8X84Y931X');
          `}
        </Script>

        {/* =====================================================
            Google Ads Conversion Event
            AW-578050842/IJFOCP7T0M0YEJq20ZMC
        ====================================================== */}

        <Script id="google-ads-conversion" strategy="afterInteractive">
          {`
            gtag('event', 'conversion', {
              'send_to': 'AW-578050842/IJFOCP7T0M0YEJq20ZMC'
            });
          `}
        </Script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8243682046974984"
     crossorigin="anonymous"></script>
      </body>
    </html>
  );
}