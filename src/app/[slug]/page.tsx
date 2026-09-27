import HomePage from "../page";
import { prisma } from "../../lib/prisma";

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

export default async function ContentSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <HomePage initialSlug={slug} />;
}

