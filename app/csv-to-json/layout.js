export const metadata = {
	title: "CSV to JSON Converter - Free Online Tool",
	description:
		"Convert CSV to JSON online for free. Paste CSV data, transform it into readable JSON, and copy or download the result instantly.",
	keywords: [
		"csv to json converter",
		"convert csv to json",
		"csv json converter online",
		"csv to json online",
		"csv to json tool",
		"csv parser online",
		"online CSV converter",
		"CSV to JSON free tool",
	],
	alternates: {
		canonical: "/csv-to-json",
	},
	openGraph: {
		title: "CSV to JSON Converter - Free Online Tool",
		description:
			"Convert CSV to JSON online for free. Paste CSV data, transform it into readable JSON, and copy or download the result instantly.",
		url: "/csv-to-json",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "CSV to JSON Converter - Free Online Tool",
		description:
			"Convert CSV to JSON online for free. Paste CSV data, transform it into readable JSON, and copy or download the result instantly.",
	},
};

export default function CsvToJsonLayout({ children }) {
	return <section>{children}</section>;
}
