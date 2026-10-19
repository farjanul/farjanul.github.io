import { Metadata } from "next";
import HomePageClient from "../../components/HomePageClient";
import { getContentGroups } from "../../lib/data";
import { prisma } from "../../lib/prisma";

export const dynamic = "force-static";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://farjanul.github.io";

function cleanExcerpt(htmlText: string, maxLength = 160): string {
  if (!htmlText) return "";
  const plain = htmlText
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trim() + "...";
}

async function fetchContentForSlug(slugParam: string) {
  try {
    const decoded = decodeURIComponent(slugParam);
    const content = await prisma.content.findFirst({
      where: {
        OR: [
          { slug: decoded },
          ...(isNaN(Number(decoded)) ? [] : [{ id: Number(decoded) }]),
        ],
      },
      include: {
        group: true,
        topic: true,
      },
    });
    return content;
  } catch (err) {
    console.warn("fetchContentForSlug error:", err);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const contents = await prisma.content.findMany({
      select: { slug: true },
    });
    return contents
      .filter((c) => Boolean(c.slug))
      .map((c) => ({ slug: c.slug as string }));
  } catch (err) {
    console.warn("generateStaticParams error:", err);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const content = await fetchContentForSlug(slug);

  if (!content) {
    return {
      title: "Content Not Found",
      description: "অনুরোধকৃত কনটেন্ট পাওয়া যায়নি।",
    };
  }

  const excerpt =
    cleanExcerpt(content.body_bn || content.body_en, 160) ||
    `${content.title} সম্পর্কিত বিস্তারিত আলোচনা ও গাইড।`;

  const canonicalUrl = `/${encodeURIComponent(content.slug || slug)}`;
  const fullPageUrl = `${siteUrl}${canonicalUrl}`;

  const keywords = [
    content.title,
    content.topic?.title,
    content.group?.name,
    "Farjanul Notes",
    "সিস্টেম ডিজাইন",
    "প্রোগ্রামিং নোট",
    "Software Architecture",
  ].filter(Boolean) as string[];

  return {
    title: content.title,
    description: excerpt,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${content.title} | Farjanul Notes`,
      description: excerpt,
      url: fullPageUrl,
      type: "article",
      siteName: "Farjanul Notes",
      locale: "bn_BD",
      publishedTime: content.created_at ? content.created_at.toISOString() : undefined,
      modifiedTime: content.updated_at ? content.updated_at.toISOString() : undefined,
      authors: ["Farjanul Islam"],
      images: [
        {
          url: `${siteUrl}/assets/img/banner.jpeg`,
          width: 1200,
          height: 634,
          alt: `${content.title} | Farjanul Notes`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${content.title} | Farjanul Notes`,
      description: excerpt,
      images: [`${siteUrl}/assets/img/banner.jpeg`],
    },
  };
}

export default async function ContentSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [groups, content] = await Promise.all([
    getContentGroups() as any,
    fetchContentForSlug(slug),
  ]);

  const canonicalUrl = content ? `/${encodeURIComponent(content.slug || slug)}` : `/${encodeURIComponent(slug)}`;
  const fullPageUrl = `${siteUrl}${canonicalUrl}`;
  const excerpt = content
    ? cleanExcerpt(content.body_bn || content.body_en, 160) || `${content.title} সম্পর্কিত বিস্তারিত আলোচনা ও গাইড।`
    : "";

  const techArticleJsonLd = content
    ? {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: content.title,
        description: excerpt,
        image: `${siteUrl}/assets/img/banner.jpeg`,
        inLanguage: "bn",
        url: fullPageUrl,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": fullPageUrl,
        },
        author: {
          "@type": "Person",
          name: "Farjanul Islam",
          url: siteUrl,
        },
        publisher: {
          "@type": "Person",
          name: "Farjanul Islam",
        },
        datePublished: content.created_at?.toISOString(),
        dateModified: content.updated_at?.toISOString(),
      }
    : null;

  const breadcrumbJsonLd = content
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "হোম",
            item: siteUrl,
          },
          ...(content.group
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: content.group.name,
                },
              ]
            : []),
          ...(content.topic
            ? [
                {
                  "@type": "ListItem",
                  position: content.group ? 3 : 2,
                  name: content.topic.title,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: content.topic ? (content.group ? 4 : 3) : (content.group ? 3 : 2),
            name: content.title,
            item: fullPageUrl,
          },
        ],
      }
    : null;

  return (
    <>
      {techArticleJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(techArticleJsonLd) }}
        />
      )}
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      <HomePageClient initialGroups={groups || []} initialSlug={slug} />
    </>
  );
}
