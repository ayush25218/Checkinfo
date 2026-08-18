import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checkinfo | Modern India Business Directory",
  description:
    "Search local businesses, browse categories, post ads, and connect with verified service providers across India.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Checkinfo | Modern India Business Directory",
    description:
      "A polished corporate local search experience for buyers and business owners.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID?.trim() || "ca-pub-6246867116640178";
  const analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?.trim();

  return (
    <html lang="en">
      <head>
        {adsenseId ? (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
            crossOrigin="anonymous"
          />
        ) : null}
        {analyticsId ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`} />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analyticsId}');`,
              }}
            />
          </>
        ) : null}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
