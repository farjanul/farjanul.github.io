import { MetadataRoute } from "next";
import { prisma } from "../lib/prisma";

export const dynamic = "force-static";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://farjanul.github.io";

  let contents: { slug: string | null; updated_at: Date }[] = [];
  try {
    contents = await prisma.content.findMany({
      select: {
        slug: true,
        updated_at: true,
      },
    });
  } catch (err) {
    console.warn("Error fetching contents for sitemap:", err);
  }

  const contentEntries: MetadataRoute.Sitemap = contents
    .filter((c) => Boolean(c.slug))
    .map((c) => ({
      url: `${siteUrl}/${encodeURIComponent(c.slug!)}`,
      lastModified: c.updated_at || new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...contentEntries,
  ];
}
