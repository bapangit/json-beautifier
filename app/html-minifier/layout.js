import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
	title: "HTML Minifier - Free Online Tool",
	description:
		"Minify HTML online for free. Paste HTML markup, remove unnecessary whitespace and comments, and copy or download the compact result instantly.",
	keywords: [
		"html minifier",
		"minify html online",
		"html compressor",
		"compress html",
		"html minifier online",
		"html optimizer",
		"online HTML tool",
		"HTML minifier free tool",
	],
	alternates: { canonical: "/html-minifier" },
	openGraph: {
		title: "HTML Minifier - Free Online Tool",
		description:
			"Minify HTML online for free. Paste HTML markup, remove unnecessary whitespace and comments, and copy or download the compact result instantly.",
		url: "/html-minifier",
		siteName: SITE_NAME,
		type: "website",
		images: [
			{
				url: OG_IMAGE,
				width: 1200,
				height: 630,
				alt: `${SITE_NAME} online HTML minifier`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "HTML Minifier - Free Online Tool",
		description:
			"Minify HTML online for free. Paste HTML markup, remove unnecessary whitespace and comments, and copy or download the compact result instantly.",
		images: [
			{
				url: TWITTER_IMAGE,
				alt: `${SITE_NAME} online HTML minifier`,
			},
		],
	},
};

export default function HtmlMinifierLayout({ children }) {
	return <section>{children}</section>;
}
