import { OG_IMAGE, SITE_NAME, TWITTER_IMAGE } from "../seo";

export const metadata = {
	title: "HTML Beautifier - Free Online Tool",
	description:
		"Beautify HTML online for free. Paste HTML markup, format it with readable indentation, and copy or download the result instantly.",
	keywords: [
		"html beautifier",
		"html formatter",
		"beautify html online",
		"format html online",
		"html beautifier online",
		"html pretty printer",
		"online HTML tool",
		"HTML formatter free tool",
	],
	alternates: { canonical: "/html-beautifier" },
	openGraph: {
		title: "HTML Beautifier - Free Online Tool",
		description:
			"Beautify HTML online for free. Paste HTML markup, format it with readable indentation, and copy or download the result instantly.",
		url: "/html-beautifier",
		siteName: SITE_NAME,
		type: "website",
		images: [
			{
				url: OG_IMAGE,
				width: 1200,
				height: 630,
				alt: `${SITE_NAME} online HTML beautifier`,
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "HTML Beautifier - Free Online Tool",
		description:
			"Beautify HTML online for free. Paste HTML markup, format it with readable indentation, and copy or download the result instantly.",
		images: [
			{
				url: TWITTER_IMAGE,
				alt: `${SITE_NAME} online HTML beautifier`,
			},
		],
	},
};

export default function HtmlBeautifierLayout({ children }) {
	return <section>{children}</section>;
}
