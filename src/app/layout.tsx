import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/atom-one-dark.css";
import { AppProvider } from "./AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://farjanul.github.io";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#111827" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Farjanul Notes - প্রোগ্রামিং ও সিস্টেম ডিজাইন নোটবুক",
    template: "%s | Farjanul Notes",
  },
  description:
    "প্রোগ্রামিং, সফটওয়্যার আর্কিটেকচার, সিস্টেম ডিজাইন, ডিজাইন প্যাটার্ন ও ডেভলপমেন্ট সম্পর্কিত বাংলায় সহজ ও গভীর নোটবুক।",
  applicationName: "Farjanul Notes",
  authors: [{ name: "Farjanul Islam", url: siteUrl }],
  generator: "Next.js",
  keywords: [
    "প্রোগ্রামিং নোট",
    "সিস্টেম ডিজাইন",
    "ডিজাইন প্যাটার্ন",
    "সফটওয়্যার ইঞ্জিনিয়ারিং",
    "System Design in Bengali",
    "Design Patterns",
    "বাংলা টিউটোরিয়াল",
    "Farjanul Notes",
    "Farjanul Islam",
    "Web Architecture",
    "Backend Engineering",
  ],
  creator: "Farjanul Islam",
  publisher: "Farjanul Islam",
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: siteUrl,
    siteName: "Farjanul Notes",
    title: "Farjanul Notes - প্রোগ্রামিং ও সিস্টেম ডিজাইন নোটবুক",
    description:
      "প্রোগ্রামিং, সফটওয়্যার আর্কিটেকচার, সিস্টেম ডিজাইন ও ডিজাইন প্যাটার্ন সম্পর্কিত বাংলায় বিস্তারিত নোট।",
    images: [
      {
        url: "/assets/img/banner.jpeg",
        width: 1200,
        height: 634,
        alt: "Farjanul Notes - Insights, Tech, & Personal Notes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farjanul Notes - প্রোগ্রামিং ও সিস্টেম ডিজাইন নোটবুক",
    description:
      "প্রোগ্রামিং, সফটওয়্যার আর্কিটেকচার, সিস্টেম ডিজাইন ও ডিজাইন প্যাটার্ন সম্পর্কিত বাংলায় বিস্তারিত নোট।",
    images: ["/assets/img/banner.jpeg"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Farjanul Notes",
  url: siteUrl,
  image: `${siteUrl}/assets/img/banner.jpeg`,
  description:
    "প্রোগ্রামিং, সফটওয়্যার আর্কিটেকচার ও সিস্টেম ডিজাইন সম্পর্কিত বাংলায় নোটবুক।",
  inLanguage: "bn",
  author: {
    "@type": "Person",
    name: "Farjanul Islam",
    url: siteUrl,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className={`rounded-corners theme-clean no-tint sidebar-filled sidebar-list-default links-default depth-subtle font-Inter sheet-open:gutter-stable ${geistSans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem("theme");
                if (savedTheme === "dark") {
                  document.documentElement.classList.add("dark");
                } else {
                  document.documentElement.classList.remove("dark");
                }
              } catch (e) {}
            `,
          }}
        />
        <link rel="stylesheet" href="/assets/css/be7109aab8486447.css" />
        <link rel="stylesheet" href="/assets/css/bd9d9d5fb87aa139.css" />
        <link rel="stylesheet" href="/assets/css/7a383765bb37d42c.css" />
        <link rel="stylesheet" href="/assets/css/e3d65466d47b91eb.css" />
        <link rel="stylesheet" href="/assets/css/gitbook-inline.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body suppressHydrationWarning className="site-background sheet-open:overflow-hidden">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
