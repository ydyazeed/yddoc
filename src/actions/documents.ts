"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

async function getCurrentUserId(): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
    throw new Error("Not authenticated")
  }
  return user.id
}

export async function createDocument() {
  const userId = await getCurrentUserId()

  const doc = await prisma.document.create({
    data: {
      title: "Untitled Document",
      content: {},
      ownerId: userId,
    },
  })

  redirect(`/documents/${doc.id}`)
}

export async function getMyDocuments() {
  const userId = await getCurrentUserId()

  return prisma.document.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      updatedAt: true,
      owner: { select: { name: true, email: true } },
    },
  })
}

export async function getSharedDocuments() {
  const userId = await getCurrentUserId()

  return prisma.documentAccess.findMany({
    where: { userId },
    orderBy: { accessedAt: "desc" },
    select: {
      document: {
        select: {
          id: true,
          title: true,
          updatedAt: true,
          owner: { select: { name: true, email: true } },
        },
      },
    },
  })
}

export async function getDocument(id: string) {
  const userId = await getCurrentUserId()

  const doc = await prisma.document.findFirst({
    where: {
      id,
      OR: [
        { ownerId: userId },
        {
          shares: {
            some: {
              role: "EDITOR",
            },
          },
        },
      ],
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      shares: true,
    },
  })

  return doc
}

export async function getDocumentForEditor(id: string) {
  const userId = await getCurrentUserId()

  const doc = await prisma.document.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  })

  if (!doc) return null

  const isOwner = doc.ownerId === userId
  if (isOwner) return { ...doc, isOwner: true, editorShareToken: null }

  // Allow access for users who previously visited a shared link
  const access = await prisma.documentAccess.findUnique({
    where: { userId_documentId: { userId, documentId: id } },
  })

  if (!access) return null

  // Check if an editor share exists so the user retains edit access
  const editorShare = await prisma.documentShare.findFirst({
    where: { documentId: id, role: "EDITOR" },
    select: { shareToken: true },
  })

  return { ...doc, isOwner: false, editorShareToken: editorShare?.shareToken ?? null }
}

export async function updateDocument(
  id: string,
  data: { title?: string; content?: Prisma.InputJsonValue },
  shareToken?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Verify ownership OR editor share token
  const doc = await prisma.document.findUnique({ where: { id } })
  if (!doc) throw new Error("Document not found")

  const isOwner = doc.ownerId === user.id

  if (!isOwner) {
    // Must have valid editor share token
    if (!shareToken) throw new Error("Forbidden")
    const share = await prisma.documentShare.findFirst({
      where: { documentId: id, shareToken, role: "EDITOR" },
    })
    if (!share) throw new Error("Forbidden")
  }

  await prisma.document.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.content !== undefined && { content: data.content }),
    },
  })

  revalidatePath(`/documents/${id}`)
}

export async function deleteDocument(id: string) {
  const userId = await getCurrentUserId()

  const doc = await prisma.document.findFirst({
    where: { id, ownerId: userId },
  })

  if (!doc) throw new Error("Document not found or not authorized")

  await prisma.document.delete({ where: { id } })
  revalidatePath("/dashboard")
}
