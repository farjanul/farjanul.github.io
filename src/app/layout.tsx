import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/atom-one-dark.css";
import { AppProvider } from "./AppContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMS Notes",
  description: "Gitbook style Next.js CMS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark rounded-corners theme-clean no-tint sidebar-filled sidebar-list-default links-default depth-subtle font-Inter sheet-open:gutter-stable ${geistSans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem("theme");
                if (savedTheme === "light") {
                  document.documentElement.classList.remove("dark");
                } else {
                  document.documentElement.classList.add("dark");
                  if (!savedTheme) localStorage.setItem("theme", "dark");
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
