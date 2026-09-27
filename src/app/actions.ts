"use server";

import { prisma } from "../lib/prisma";

// ================= Content Groups =================
export async function createContentGroup(data: { name: string, position: number }) {
  return await prisma.contentGroup.create({ data });
}

export async function updateContentGroup(id: number, data: { name: string, position: number }) {
  return await prisma.contentGroup.update({ where: { id }, data });
}

export async function deleteContentGroup(id: number) {
  return await prisma.contentGroup.delete({ where: { id } });
}

export async function getContentGroups() {
  const groups = await prisma.contentGroup.findMany({
    orderBy: { position: "asc" },
    include: {
      topics: {
        orderBy: { position: "asc" },
        include: {
          contents: {
            orderBy: { position: "asc" }
          }
        }
      },
      contents: {
        where: { topic_id: null },
        orderBy: { position: "asc" }
      }
    }
  });

  return groups;
}

// ================= Topics =================
export async function createTopic(data: { group_id: number, title: string, icon?: string | null, position: number }) {
  return await prisma.topic.create({ data: data as any });
}

export async function updateTopic(id: number, data: { group_id: number, title: string, icon?: string | null, position: number }) {
  return await prisma.topic.update({ where: { id }, data: data as any });
}

export async function deleteTopic(id: number) {
  return await prisma.topic.delete({ where: { id } });
}

export async function getTopics() {
  return await prisma.topic.findMany({
    orderBy: { position: "asc" }
  });
}

import { slugify } from "../lib/slug";

async function getUniqueSlug(baseSlug: string, currentId?: number): Promise<string> {
  let slug = baseSlug || "content";
  let count = 1;
  while (true) {
    const existing = await prisma.content.findUnique({ where: { slug } });
    if (!existing || (currentId && existing.id === currentId)) {
      return slug;
    }
    slug = `${baseSlug}-${count}`;
    count++;
  }
}

// ================= Contents =================
export async function createContent(data: { group_id: number, topic_id?: number | null, title: string, slug?: string | null, icon?: string | null, body_en: string, body_bn: string, position: number }) {
  const base = data.slug ? slugify(data.slug) : slugify(data.title);
  const uniqueSlug = await getUniqueSlug(base);
  return await prisma.content.create({ data: { ...data, slug: uniqueSlug } as any });
}

export async function updateContent(id: number, data: { group_id: number, topic_id?: number | null, title: string, slug?: string | null, icon?: string | null, body_en: string, body_bn: string, position: number }) {
  const base = data.slug ? slugify(data.slug) : slugify(data.title);
  const uniqueSlug = await getUniqueSlug(base, id);
  return await prisma.content.update({ where: { id }, data: { ...data, slug: uniqueSlug } as any });
}

export async function getContentBySlug(slug: string) {
  return await prisma.content.findUnique({
    where: { slug },
    include: {
      group: true,
      topic: true,
    }
  });
}

export async function deleteContent(id: number) {
  return await prisma.content.delete({ where: { id } });
}

export async function getContents() {
  return await prisma.content.findMany({
    orderBy: { position: "asc" }
  });
}

// ================= Bulk Operations =================
export async function bulkDeleteGroups(ids: number[]) {
  if (!ids.length) return;
  await prisma.content.deleteMany({ where: { group_id: { in: ids } } });
  await prisma.topic.deleteMany({ where: { group_id: { in: ids } } });
  return await prisma.contentGroup.deleteMany({ where: { id: { in: ids } } });
}

export async function bulkDeleteTopics(ids: number[]) {
  if (!ids.length) return;
  await prisma.content.deleteMany({ where: { topic_id: { in: ids } } });
  return await prisma.topic.deleteMany({ where: { id: { in: ids } } });
}

export async function bulkDeleteContents(ids: number[]) {
  if (!ids.length) return;
  return await prisma.content.deleteMany({ where: { id: { in: ids } } });
}
