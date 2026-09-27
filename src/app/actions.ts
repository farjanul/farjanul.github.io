"use server";

import { prisma } from "../lib/prisma";
import { slugify } from "../lib/slug";
import {
  getContentGroups as getDbContentGroups,
  getTopics as getDbTopics,
  getContentBySlug as getDbContentBySlug,
  getContents as getDbContents,
} from "../lib/data";

export async function getContentGroups() {
  return await getDbContentGroups();
}

export async function getTopics() {
  return await getDbTopics();
}

export async function getContentBySlug(slug: string) {
  return await getDbContentBySlug(slug);
}

export async function getContents() {
  return await getDbContents();
}

async function checkAdmin() {
  const { getSession } = await import("../lib/session");
  const session = await getSession();
  if (!session.isLoggedIn) {
    throw new Error("Unauthorized: Admin access required.");
  }
}

// ================= Content Groups =================
export async function createContentGroup(data: { name: string; position: number }) {
  await checkAdmin();
  return await prisma.contentGroup.create({ data });
}

export async function updateContentGroup(id: number, data: { name: string; position: number }) {
  await checkAdmin();
  return await prisma.contentGroup.update({ where: { id }, data });
}

export async function deleteContentGroup(id: number) {
  await checkAdmin();
  return await prisma.contentGroup.delete({ where: { id } });
}

// ================= Topics =================
export async function createTopic(data: { group_id: number; title: string; icon?: string | null; position: number }) {
  await checkAdmin();
  return await prisma.topic.create({ data: data as any });
}

export async function updateTopic(id: number, data: { group_id: number; title: string; icon?: string | null; position: number }) {
  await checkAdmin();
  return await prisma.topic.update({ where: { id }, data: data as any });
}

export async function deleteTopic(id: number) {
  await checkAdmin();
  return await prisma.topic.delete({ where: { id } });
}

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
export async function createContent(data: { group_id: number; topic_id?: number | null; title: string; slug?: string | null; icon?: string | null; body_en: string; body_bn: string; position: number }) {
  await checkAdmin();
  const base = data.slug ? slugify(data.slug) : slugify(data.title);
  const uniqueSlug = await getUniqueSlug(base);
  return await prisma.content.create({ data: { ...data, slug: uniqueSlug } as any });
}

export async function updateContent(id: number, data: { group_id: number; topic_id?: number | null; title: string; slug?: string | null; icon?: string | null; body_en: string; body_bn: string; position: number }) {
  await checkAdmin();
  const base = data.slug ? slugify(data.slug) : slugify(data.title);
  const uniqueSlug = await getUniqueSlug(base, id);
  return await prisma.content.update({ where: { id }, data: { ...data, slug: uniqueSlug } as any });
}

export async function deleteContent(id: number) {
  await checkAdmin();
  return await prisma.content.delete({ where: { id } });
}

// ================= Bulk Operations =================
export async function bulkDeleteGroups(ids: number[]) {
  await checkAdmin();
  if (!ids.length) return;
  await prisma.content.deleteMany({ where: { group_id: { in: ids } } });
  await prisma.topic.deleteMany({ where: { group_id: { in: ids } } });
  return await prisma.contentGroup.deleteMany({ where: { id: { in: ids } } });
}

export async function bulkDeleteTopics(ids: number[]) {
  await checkAdmin();
  if (!ids.length) return;
  await prisma.content.deleteMany({ where: { topic_id: { in: ids } } });
  return await prisma.topic.deleteMany({ where: { id: { in: ids } } });
}

export async function bulkDeleteContents(ids: number[]) {
  await checkAdmin();
  if (!ids.length) return;
  return await prisma.content.deleteMany({ where: { id: { in: ids } } });
}
