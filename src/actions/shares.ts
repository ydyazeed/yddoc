"use server"

import { revalidatePath } from "next/cache"
import { nanoid } from "nanoid"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { ShareRole } from "@prisma/client"

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")
  return user.id
}

async function verifyOwner(documentId: string, userId: string) {
  const doc = await prisma.document.findFirst({
    where: { id: documentId, ownerId: userId },
  })
  if (!doc) throw new Error("Not authorized")
  return doc
}

export async function createShareLink(documentId: string, role: ShareRole) {
  const userId = await getCurrentUserId()
  await verifyOwner(documentId, userId)

  const shareToken = nanoid(21)

  const share = await prisma.documentShare.create({
    data: { documentId, shareToken, role },
  })

  revalidatePath(`/documents/${documentId}`)
  return share
}

export async function getShareLinks(documentId: string) {
  const userId = await getCurrentUserId()
  await verifyOwner(documentId, userId)

  return prisma.documentShare.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteShareLink(shareId: string) {
  const userId = await getCurrentUserId()

  const share = await prisma.documentShare.findUnique({
    where: { id: shareId },
    include: { document: { select: { ownerId: true } } },
  })

  if (!share || share.document.ownerId !== userId) {
    throw new Error("Not authorized")
  }

  await prisma.documentShare.delete({ where: { id: shareId } })
  revalidatePath(`/documents/${share.documentId}`)
}

export async function getDocumentByToken(token: string) {
  const share = await prisma.documentShare.findUnique({
    where: { shareToken: token },
    include: {
      document: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      },
    },
  })

  return share
}

export async function recordDocumentAccess(documentId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return // Only track authenticated users

  await prisma.documentAccess.upsert({
    where: { userId_documentId: { userId: user.id, documentId } },
    update: { accessedAt: new Date() },
    create: { userId: user.id, documentId },
  })
}
