import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./storefront-polish.css";
import "./marketplace.css";

export const metadata: Metadata = {
  title: "Nicho-Xpress | Zambia Marketplace & Sourcing Concierge",
  description:
    "Browse featured finds or send Nicho-Xpress a product link. Get help sourcing it and receive a clear quote in Zambian kwacha before deciding.",
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en-ZM">
      <body>{children}</body>
    </html>
  );
}
