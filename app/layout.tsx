import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veranstaltungsbuchung",
  description: "Buchen Sie Plätze für Workshops, Vorträge und Events",
  openGraph: {
    title: "Veranstaltungsbuchung",
    description: "Buchen Sie Plätze für Workshops, Vorträge und Events",
    type: "website",
    locale: "de_DE",
  },
  twitter: {
    card: "summary_large_image",
    title: "Veranstaltungsbuchung",
    description: "Buchen Sie Plätze für Workshops, Vorträge und Events",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
