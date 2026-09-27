import { prisma } from "./prisma";

export async function getContentGroups() {
  const groups = await prisma.contentGroup.findMany({
    orderBy: { position: "asc" },
    include: {
      topics: {
        orderBy: { position: "asc" },
        include: {
          contents: {
            orderBy: { position: "asc" },
          },
        },
      },
      contents: {
        where: { topic_id: null },
        orderBy: { position: "asc" },
      },
    },
  });

  return groups;
}

export async function getTopics() {
  return await prisma.topic.findMany({
    orderBy: { position: "asc" },
  });
}

export async function getContentBySlug(slug: string) {
  return await prisma.content.findUnique({
    where: { slug },
    include: {
      group: true,
      topic: true,
    },
  });
}

export async function getContents() {
  return await prisma.content.findMany({
    orderBy: { position: "asc" },
  });
}
