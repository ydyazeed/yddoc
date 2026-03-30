import { describe, it, expect, vi, beforeEach } from "vitest"

// Hoisted mocks to avoid initialization order issues
const mockGetUser = vi.hoisted(() => vi.fn())
const mockPrisma = vi.hoisted(() => ({
  document: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  documentAccess: {
    findMany: vi.fn(),
  },
  documentShare: {
    findFirst: vi.fn(),
  },
}))

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: { getUser: mockGetUser },
  }),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))

import { redirect } from "next/navigation"
import {
  getMyDocuments,
  updateDocument,
  deleteDocument,
} from "@/actions/documents"

const TEST_USER_ID = "user-uuid-123"
const TEST_DOC_ID = "doc-uuid-456"

beforeEach(() => {
  vi.clearAllMocks()
  mockGetUser.mockResolvedValue({ data: { user: { id: TEST_USER_ID } } })
})

describe("getMyDocuments", () => {
  it("returns documents for authenticated user", async () => {
    const mockDocs = [
      {
        id: TEST_DOC_ID,
        title: "My Doc",
        updatedAt: new Date(),
        owner: { name: "Alice", email: "alice@example.com" },
      },
    ]
    mockPrisma.document.findMany.mockResolvedValueOnce(mockDocs)

    const result = await getMyDocuments()

    expect(mockPrisma.document.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { ownerId: TEST_USER_ID },
        orderBy: { updatedAt: "desc" },
      })
    )
    expect(result).toEqual(mockDocs)
  })

  it("redirects to login when not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null } })

    await expect(getMyDocuments()).rejects.toThrow("Not authenticated")
    expect(redirect).toHaveBeenCalledWith("/login")
  })
})

describe("updateDocument", () => {
  it("updates document when user is owner", async () => {
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      id: TEST_DOC_ID,
      ownerId: TEST_USER_ID,
    })
    mockPrisma.document.update.mockResolvedValueOnce({})

    await updateDocument(TEST_DOC_ID, { title: "New Title" })

    expect(mockPrisma.document.update).toHaveBeenCalledWith({
      where: { id: TEST_DOC_ID },
      data: { title: "New Title" },
    })
  })

  it("throws when non-owner tries to update without share token", async () => {
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      id: TEST_DOC_ID,
      ownerId: "other-user-id",
    })

    await expect(
      updateDocument(TEST_DOC_ID, { title: "Hack" })
    ).rejects.toThrow("Forbidden")
  })

  it("allows update with valid editor share token", async () => {
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      id: TEST_DOC_ID,
      ownerId: "other-user-id",
    })
    mockPrisma.documentShare.findFirst.mockResolvedValueOnce({
      id: "share-id",
      shareToken: "valid-token",
      role: "EDITOR",
    })
    mockPrisma.document.update.mockResolvedValueOnce({})

    await updateDocument(TEST_DOC_ID, { title: "Shared Edit" }, "valid-token")

    expect(mockPrisma.document.update).toHaveBeenCalled()
  })

  it("throws when share token has viewer role", async () => {
    mockPrisma.document.findUnique.mockResolvedValueOnce({
      id: TEST_DOC_ID,
      ownerId: "other-user-id",
    })
    mockPrisma.documentShare.findFirst.mockResolvedValueOnce(null)

    await expect(
      updateDocument(TEST_DOC_ID, { title: "Blocked" }, "viewer-token")
    ).rejects.toThrow("Forbidden")
  })

  it("throws when document does not exist", async () => {
    mockPrisma.document.findUnique.mockResolvedValueOnce(null)

    await expect(
      updateDocument("nonexistent-id", { title: "Ghost" })
    ).rejects.toThrow("Document not found")
  })
})

describe("deleteDocument", () => {
  it("deletes document owned by user", async () => {
    mockPrisma.document.findFirst.mockResolvedValueOnce({
      id: TEST_DOC_ID,
      ownerId: TEST_USER_ID,
    })
    mockPrisma.document.delete.mockResolvedValueOnce({})

    await deleteDocument(TEST_DOC_ID)

    expect(mockPrisma.document.delete).toHaveBeenCalledWith({
      where: { id: TEST_DOC_ID },
    })
  })

  it("throws when user does not own the document", async () => {
    mockPrisma.document.findFirst.mockResolvedValueOnce(null)

    await expect(deleteDocument(TEST_DOC_ID)).rejects.toThrow(
      "Document not found or not authorized"
    )
  })
})
